import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async () => {
    try {
        const offices = await prisma.offices.findMany({
            orderBy: { id: 'asc' }
        })
        return { ok: true, data: offices }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener oficinas',
        })
    }
})
