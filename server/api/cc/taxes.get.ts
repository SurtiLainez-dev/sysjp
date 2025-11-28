import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const taxes = await prisma.taxes.findMany({
            orderBy: { id: 'asc' },
            include: { account: true }
        })
        return { ok: true, data: taxes }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener los impuestos',
        })
    }
})
