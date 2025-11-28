import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const tokenData = (event.context as any).auth;

    const rows = await prisma.work_orders.findMany({
        where: {
            office_id: Number(tokenData.user.office_id),
            status: 'CERRADA',
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

    return data
})
