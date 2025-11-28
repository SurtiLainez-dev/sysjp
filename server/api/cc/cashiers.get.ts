import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const q = getQuery(event)

    // Filtros opcionales
    const officeId = q.office_id ? Number(q.office_id) : undefined
    const isActive = typeof q.is_active !== 'undefined'
        ? String(q.is_active).toLowerCase() === 'true'
        : undefined
    const search = (q.search as string | undefined)?.trim() || undefined

    // Paginación opcional
    const page = q.page ? Math.max(1, Number(q.page)) : 1
    const pageSize = q.pageSize ? Math.max(1, Number(q.pageSize)) : 20
    const skip = (page - 1) * pageSize
    const take = pageSize

    const where: any = {}
    if (typeof officeId === 'number') where.office_id = officeId
    if (typeof isActive === 'boolean') where.is_active = isActive
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { office: { name: { contains: search } } },
            { user: { username: { contains: search } } },
        ]
    }

    const [items, total] = await Promise.all([
        prisma.cashiers.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: {
                office: { select: { id: true, name: true, nickname: true } },
                user:   { select: { id: true, username: true, is_active: true } },
                account:{ select: { id: true, code: true, name: true, type: true } }, // útil verlo también
            },
            skip,
            take,
        }),
        prisma.cashiers.count({ where }),
    ])

    return {
        ok: true,
        data: items,
        meta: {
            total,
            page,
            pageSize,
            pages: Math.ceil(total / pageSize) || 1,
        },
    }
})
