import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const accounts = await prisma.bank_accounts.findMany({
            orderBy: { id: 'asc' },
            include: {
                bank: {
                    select: { name: true, id: true}
                },
                account: true
            }
        })

        return { ok: true, data: accounts }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener cuentas de bancos' })
    }
})
