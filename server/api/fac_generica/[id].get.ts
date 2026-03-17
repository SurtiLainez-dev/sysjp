import { prisma } from "../../utils/prisma"
import { defineEventHandler, createError } from "h3"

export default defineEventHandler(async (event) => {
    try {
        const id = Number(event.context.params?.id)

        if (!id || isNaN(id)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Id inválido",
            })
        }

        const factura = await prisma.facGenerica.findUnique({
            where: { id },
            include: {
                cuerpo: true,
            },
        })

        if (!factura) {
            throw createError({
                statusCode: 404,
                statusMessage: "Factura no encontrada",
            })
        }

        return {
            ok: true,
            data: factura,
        }
    } catch (error: any) {
        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage: error?.statusMessage || error?.message || "Error al consultar factura",
        })
    }
})
