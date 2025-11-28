import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const payments = await prisma.payment_methods.findMany({
            orderBy: { id: 'asc' },
            include: { account: true },
        })

        return { ok: true, data: payments }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener los metodos de pagos' })
    }
})
