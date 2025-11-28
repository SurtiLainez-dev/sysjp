import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const customers = await prisma.customers.findMany({
            orderBy: { id: 'asc' },
        })

        return { ok: true, data: customers }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener los clientes' })
    }
})
