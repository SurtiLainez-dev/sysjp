import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const taxes = await prisma.categories.findMany({
            orderBy: { id: 'asc' },
        })
        return { ok: true, data: taxes }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener las categorias',
        })
    }
})
