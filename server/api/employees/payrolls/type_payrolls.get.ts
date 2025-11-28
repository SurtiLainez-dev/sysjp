import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const type_payrolls = await prisma.type_payrolls.findMany({
            orderBy: { id: 'asc' },
        })

        return { ok: true, data: type_payrolls }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener tipo de planillas' })
    }
})
