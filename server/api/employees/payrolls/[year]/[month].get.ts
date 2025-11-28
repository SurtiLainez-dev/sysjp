import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const { year, month } = getRouterParams(event)

    if (!year || !month) {
        throw createError({ statusCode: 400, statusMessage: 'Se requiere año y mes' })
    }

    const rows = await prisma.payrolls.findMany({
        where: {
            year: Number(year),
            month: Number(month),
        },
        orderBy: { id: 'desc' },
        include: {
            office: true,
            employee: true,
        }
    })

    return { ok: true, data: rows }
})
