// server/api/work_orders/save.post.ts
import { prisma } from '@/server/utils/prisma'

type ItemInput = {
    article_id: number
    quantity: number | string
    price: number | string
    note?: string | null
}

type BodyInput = {
    customer_id: number
    office_id: number
    user_id: number
    job_detail: string
    employee_notes?: string | null
    discount?: number | string
    status: any // usa tu enum WorkOrderStatus si lo tienes importado
    items: ItemInput[]
}

function toCents(v: number) { return Math.round(Number(v) * 100) }
function fromCents(c: number) { return +(c / 100).toFixed(2) }

export default defineEventHandler(async (event) => {
    const tokenData = (event.context as any).auth
    const body = await readBody<BodyInput>(event);

    // validaciones mínimas
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'items es requerido y no puede estar vacío' })
    }
    if (!body.customer_id) {
        throw createError({ statusCode: 400, statusMessage: 'El cliente es requeridos' })
    }
    if (!body.job_detail || !String(body.job_detail).trim()) {
        throw createError({ statusCode: 400, statusMessage: 'El detalle del trabajo es requerido' })
    }


    const headerData = {
        customer_id: Number(body.customer_id),
        office_id: tokenData.user.office_id,
        user_id: tokenData.user.id,
        job_detail: String(body.job_detail),
        employee_notes: body.employee_notes ?? '--',
        subtotal: 0,
        discount: 0,
        total: body.total,
        status: 'OPEN',
        is_invoiced: false
    }

    // transacción
    const created = await prisma.$transaction(async (tx) => {
        const order = await tx.work_orders.create({
            data: headerData,
            select: { id: true }
        })

        const itemsToCreate = (body.items || []).map((it: any) => ({
            work_order_id: order.id,
            article_id: Number(it.articulo_id),
            quantity: Number(it.cant),
            price: Number(it.precio),
            total: Number(it.total),
            note: it.note ?? null
        }))

        if (itemsToCreate.length) {
            await tx.work_order_items.createMany({
                data: itemsToCreate
            })
        }
    })

    return { ok: true, data: created }
})
