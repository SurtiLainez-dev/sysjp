// server/api/work_orders/close.post.ts
import { prisma } from '@/server/utils/prisma'


export default defineEventHandler(async (event) => {
    const body = await readBody<{ id?: number }>(event)
    const id = Number(body?.id)

    if (!Number.isFinite(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }


    const current = await prisma.work_orders.findUnique({
        where: { id },
        select: { id: true, status: true }
    })
    if (!current) {
        throw createError({ statusCode: 404, statusMessage: 'Orden no encontrada' })
    }


    const updated = await prisma.work_orders.update({
        where: { id },
        data: { status: 'CERRADA' }, // casteo para soportar ambas variantes
        select: { id: true, status: true, updated_at: true }
    })

    return { ok: true, data: updated }
})
