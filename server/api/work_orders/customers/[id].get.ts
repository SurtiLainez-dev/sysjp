import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!Number.isFinite(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }


    const rows = await prisma.work_orders.findMany({
        where: {
            customer_id: Number(idParam),
        },
        select: {
            id: true,
            total: true,
            status: true,
            created_at: true,
            updated_at: true,
            office: { select: { name: true } },
            user:   { select: { username: true } },
            customer: { select: { name: true } },
        },
        orderBy: { id: 'desc' },
    })


    const data = rows.map(r => ({
        id: r.id,
        total: Number(r.total),
        status: r.status,
        office_name: r.office?.name ?? null,
        user_name: r.user?.username ?? null,
        customer_name: r.customer?.name ?? null,
        updated_at: r.updated_at ?? null,
        created_at: r.created_at ?? null
    }))

    const customers = await prisma.customers.findFirst({
        where: {
            id: Number(idParam),
        },
    })

    return {data:data, customer:customers}
})
