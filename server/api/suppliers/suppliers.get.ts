import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const suppliers = await prisma.suppliers.findMany({
            orderBy: { id: 'asc' },
            include: { account: true }
        })
        return { ok: true, data: suppliers }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener proveedores',
        })
    }
})
