// server/api/entry-orders.get.ts
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    const rows = await prisma.entry_orders.findMany({
        orderBy: [
            { date: 'desc' },
            { id: 'desc' }
        ],
        select: {
            id: true,
            code: true,
            date: true,
            total_amount: true,
            disccount:    true,
            supplier: {
                select: {
                    id: true,
                    name: true,
                }
            },
            branch: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    return { ok: true, total: rows.length, data: rows }
})
