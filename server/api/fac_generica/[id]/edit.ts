import { prisma } from "../../../utils/prisma"
import { defineEventHandler, readBody, createError } from "h3"

const TAX_RATE = 0.053
const SQUARE_RATE = 0.035
const SQUARE_FIXED = 0.15

function round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

function toNumber(value: unknown): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

export default defineEventHandler(async (event) => {
    try {
        const id = Number(event.context.params?.id)

        if (!id || Number.isNaN(id)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Id inválido",
            })
        }

        const existente = await prisma.facGenerica.findUnique({
            where: { id },
            select: { id: true },
        })

        if (!existente) {
            throw createError({
                statusCode: 404,
                statusMessage: "Factura no encontrada",
            })
        }

        const body = await readBody(event)

        const fecha = body?.fecha ? new Date(body.fecha) : new Date()
        const cliente = body?.cliente ? String(body.cliente).trim() : null
        const direccion_envio = body?.direccion_envio
            ? String(body.direccion_envio).trim()
            : null

        const fecha_maximo_envio = body?.fecha_maximo_envio
            ? new Date(body.fecha_maximo_envio)
            : null

        const observacion = body?.observacion
            ? String(body.observacion).trim()
            : null

        const paga_con_tarjeta = Boolean(body?.paga_con_tarjeta)
        const items = Array.isArray(body?.cuerpo) ? body.cuerpo : []

        if (!items.length) {
            throw createError({
                statusCode: 400,
                statusMessage: "Debe enviar al menos un item en el cuerpo de la factura",
            })
        }

        const cuerpoProcesado = items.map((item: any, index: number) => {
            const cod = item?.cod ? String(item.cod).trim() : null
            const articulo = item?.articulo ? String(item.articulo).trim() : ""
            const precio = round2(toNumber(item?.precio))
            const cantidad = round2(toNumber(item?.cantidad))
            const descuentoUnidad = round2(toNumber(item?.descuento_unidad))

            const total_descuento = round2(descuentoUnidad * cantidad)
            const total_registro = round2(Math.max(precio * cantidad - total_descuento, 0))

            return {
                cod,
                articulo,
                precio,
                cantidad,
                descuento_unidad: descuentoUnidad,
                total_descuento,
                total_registro,
                orden: Number(item?.orden ?? index + 1),
            }
        })

        const itemsValidos = cuerpoProcesado.filter((item) => item.articulo !== "")

        if (!itemsValidos.length) {
            throw createError({
                statusCode: 400,
                statusMessage: "Debe enviar al menos un artículo válido",
            })
        }

        const total_descuento = round2(
            itemsValidos.reduce((acc, item) => acc + item.total_descuento, 0)
        )

        const sub_total = round2(
            itemsValidos.reduce((acc, item) => acc + item.total_registro, 0)
        )

        const taxes = round2(sub_total * TAX_RATE)

        const total_sin_fee = round2(sub_total + taxes)

        const base_neta_para_square = paga_con_tarjeta
            ? total_sin_fee
            : 0

        const total_a_colocar_square = paga_con_tarjeta
            ? round2((base_neta_para_square + SQUARE_FIXED) / (1 - SQUARE_RATE))
            : 0

        const square_fee_calculado = paga_con_tarjeta
            ? round2(total_a_colocar_square - base_neta_para_square)
            : 0

        const total = paga_con_tarjeta
            ? total_a_colocar_square
            : total_sin_fee

        const facturaActualizada = await prisma.$transaction(async (tx) => {
            await tx.cuerpoFacGenerica.deleteMany({
                where: {
                    facGenericaId: id,
                },
            })

            const factura = await tx.facGenerica.update({
                where: { id },
                data: {
                    fecha,
                    cliente,
                    direccion_envio,
                    fecha_maximo_envio,
                    observacion,
                    paga_con_tarjeta,

                    total_descuento,
                    sub_total,
                    taxes,
                    total,
                    total_a_colocar_square,
                    square_fee_calculado,

                    tasa_tax: TAX_RATE,
                    tasa_square: SQUARE_RATE,
                    fee_square_fijo: SQUARE_FIXED,

                    cuerpo: {
                        create: itemsValidos,
                    },
                },
                include: {
                    cuerpo: {
                        orderBy: {
                            orden: "asc",
                        },
                    },
                },
            })

            return factura
        })

        return {
            ok: true,
            message: "Factura actualizada correctamente",
            data: facturaActualizada,
        }
    } catch (error: any) {
        console.error("ERROR edit fac_generica:", error)

        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage:
                error?.statusMessage || error?.message || "Error al actualizar la factura",
        })
    }
})
