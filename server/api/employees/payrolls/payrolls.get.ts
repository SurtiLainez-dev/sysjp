import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const payrolls = await prisma.payrolls.findMany({
            orderBy: { id: 'asc' },
            include: {
                office: true,
                employee: true,
                bank_account: {
                    include: {bank: true, account: true}
                },
            }
        })

        return { ok: true, data: payrolls }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener las planillas' })
    }
})
