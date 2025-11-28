import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const banks = await prisma.banks.findMany({
            orderBy: { id: 'asc' },
        })

        return { ok: true, data: banks }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener bancos' })
    }
})
