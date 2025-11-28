import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event:any) => {
    const dateStr = getRouterParam(event, 'date')
    if (!dateStr) {
        throw createError({ statusCode: 400, statusMessage: 'Falta parámetro date (YYYY-MM-DD)' })
    }


    const [y, m, d] = dateStr.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
    const end   = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0))

    const transactions = await prisma.transactions.findMany({
        where: {
            created_at: { gte: start, lt: end }
        },
        orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
        include: {
            lines: {
                include: {
                    account: true
                }
            },
            office: true
        }
    })

    return { ok: true, date: dateStr, count: transactions.length, data: transactions }
})
