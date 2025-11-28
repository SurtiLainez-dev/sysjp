// server/api/work_orders/[id].put.ts
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    if (!Number.isFinite(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    const body = await readBody<any>(event)
    const items: any[] = Array.isArray(body.items) ? body.items : []

    // --- Header: solo lo que pediste ---
    const updateHeader: any = {}
    if (typeof body.job_detail === 'string') updateHeader.job_detail = body.job_detail
    if (typeof body.notes !== 'undefined') updateHeader.employee_notes = body.notes ?? null
    if (typeof body.total !== 'undefined') updateHeader.total = Number(body.total)

    // recalcular subtotal desde los items que NO están removidos
    const subtotal = items
        .filter((i) => !i?.removed)
        .reduce((a, i) => a + Number(i?.total || 0), 0)
    if (Number.isFinite(subtotal)) updateHeader.subtotal = Number(subtotal.toFixed(2))

    const updated = await prisma.$transaction(async (tx) => {
        // 1) Update header
        await tx.work_orders.update({
            where: { id },
            data: updateHeader
        })

        // 2) Items: build ops
        const updates: Array<{ where: any; data: any }> = []
        const zeroUpdates: Array<{ where: any; data: any }> = []
        const creates: any[] = []

        for (const it of items) {
            const persisted = !!it?.persisted || !!it?.id
            const removed = !!it?.removed

            if (persisted && it?.id) {
                // Línea existente en DB
                if (removed) {
                    zeroUpdates.push({
                        where: { id: Number(it.id) },
                        data: { quantity: 0, total: 0 }
                    })
                } else {
                    updates.push({
                        where: { id: Number(it.id) },
                        data: {
                            article_id: Number(it.articulo_id),
                            quantity: Number(it.cant),
                            price: Number(it.precio),
                            total: Number(it.total),
                            note: it.note ?? null
                        }
                    })
                }
            } else {
                // Línea nueva
                if (!removed && it?.articulo_id) {
                    creates.push({
                        work_order_id: id,
                        article_id: Number(it.articulo_id),
                        quantity: Number(it.cant),
                        price: Number(it.precio),
                        total: Number(it.total),
                        note: it.note ?? null
                    })
                }
            }
        }

        // 3) Ejecutar ops
        for (const u of zeroUpdates) await tx.work_order_items.update(u)
        for (const u of updates) await tx.work_order_items.update(u)
        if (creates.length) await tx.work_order_items.createMany({ data: creates })

        // 4) (opcional) devolver lo mínimo
        return tx.work_orders.findFirst({
            where: { id },
            select: { id: true, subtotal: true, total: true, employee_notes: true, job_detail: true }
        })
    })

    return { ok: true, data: updated }
})
