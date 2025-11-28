// server/api/work_orders/[id].get.ts
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!Number.isFinite(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    const row = await prisma.work_orders.findUnique({
        where: { id },
        include: {
            office:   { select: { id: true, name: true } },
            user:     { select: { id: true, username: true } },
            customer: { select: { id: true, name: true } },
            items: {
                include: {
                    article: { select: { id: true, name: true, bar_code: true, sku: true, sale_price: true } }
                }
            }
        }
    })

    if (!row) {
        throw createError({ statusCode: 404, statusMessage: 'Orden no encontrada' })
    }


    const itemsUI = row.items.map(it => ({
        id: it.id,
        cod: `${it.article?.bar_code ?? ''} - ${it.article?.sku ?? ''}`.trim(),
        articulo_id: it.article_id,
        nombre: it.article?.name ?? '',
        precio: Number(it.price),
        cant: Number(it.quantity),
        total: Number(it.total),
        note: it.note ?? null
    }))

    const orderUI = {
        office_id:   row.office_id,
        customer_id: row.customer_id,
        notes:       row.employee_notes ?? '',
        detalle:     row.job_detail ?? '',
        descuento:   Number(row.discount) || 0,
        subtotal:    Number(row.subtotal) || 0,   // 👈 ahora viene
        total:       Number(row.total) || 0,       // 👈 ahora viene
        status:      row.status
    }

    const meta = {
        id: row.id,
        office_name:   row.office?.name ?? null,
        user_name:     row.user?.username ?? null,
        customer_name: row.customer?.name ?? null,
        created_at:    row.created_at,
        updated_at:    row.updated_at
    }

    return { ok: true, data: { order: orderUI, items: itemsUI, meta } }
})
