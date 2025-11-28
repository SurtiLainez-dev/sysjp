// server/api/receipts/work_order.post.ts
import { prisma } from '@/server/utils/prisma'
import { createError, readBody } from 'h3'
import { createReceipt } from '@/server/services/receiptService'

type Body = {
    work_order_id: number
    payment_method_id: number
    customer_id?: number | null
    notes?: string | null
}

const num = (v: any) => Number.parseFloat(String(v || 0))

export default defineEventHandler(async (event) => {
    const auth = (event.context as any).auth;
    if (!auth?.user) {
        throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    }
    if (!auth.user.cashier_id) {
        throw createError({ statusCode: 400, statusMessage: 'El usuario no tiene caja asignada' })
    }

    const body = await readBody<Body>(event)

    if (!body.work_order_id || !body.payment_method_id) {
        throw createError({
            statusCode: 422,
            statusMessage: 'work_order_id y payment_method_id son obligatorios'
        })
    }

    // 1) Traer la orden de trabajo con items + artículos + taxes
    const workOrder = await prisma.work_orders.findUnique({
        where: { id: body.work_order_id },
        include: {
            customer: { select: { id: true, name: true } },
            items: {
                include: {
                    article: {
                        include: {
                            taxes: {
                                where: { is_active: true },
                                include: {
                                    tax: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!workOrder) {
        throw createError({ statusCode: 404, statusMessage: 'Orden de trabajo no encontrada' })
    }

    // opcional: asegurar que sea de la misma oficina que la caja
    if (workOrder.office_id !== auth.user.office_id) {
        throw createError({
            statusCode: 403,
            statusMessage: 'La orden de trabajo pertenece a otra oficina'
        })
    }

    if (workOrder.is_invoiced) {
        throw createError({
            statusCode: 400,
            statusMessage: 'La orden ya fue facturada o no está abierta'
        })
    }

    if (!workOrder.items.length) {
        throw createError({
            statusCode: 400,
            statusMessage: 'La orden de trabajo no tiene items'
        })
    }

    // 2) Construir los items para el recibo (igual formato que /api/receipts/save)
    const receiptItems = workOrder.items.map((woItem) => {
        const article = woItem.article
        const qty = num(woItem.quantity)
        const unitPrice = num(woItem.price || article.sale_price) // prioriza el precio de la orden

        const taxes =
            (article.taxes || []).map((at) => ({
                tax_id: at.tax_id,
                name: at.tax.name,
                rate: num(at.tax.rate)
            })) ?? []

        return {
            article_id: article.id,
            name: article.name,
            qty,
            unit_price: unitPrice,
            taxes
        }
    })

    // 3) Resolver customer_id (puede venir del body o de la orden)
    const customer_id =
        body.customer_id ??
        (workOrder.customer_id ? Number(workOrder.customer_id) : null)

    // 4) Armar DTO para el service de creación de recibos
    const dto = {
        cashier_id: auth.user.cashier_id as number,
        user_id: auth.user.id as number,
        payment_method_id: body.payment_method_id,
        customer_id,
        work_order_id: workOrder.id,
        notes: body.notes ?? null,
        items: receiptItems
    }

    // 5) Llamar al service que ya tienes para registrar el recibo
    const receipt = await createReceipt(dto)

    // 6) (opcional) podrías marcar la orden como facturada dentro del service;

    await prisma.work_orders.update({
      where: { id: workOrder.id },
      data: { is_invoiced: true, status: 'CERRADA' }
    })

    return {
        ok: true,
        data: receipt
    }
})
