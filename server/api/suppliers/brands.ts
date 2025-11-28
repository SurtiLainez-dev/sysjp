import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const brands = await prisma.brands.findMany({
            orderBy: { id: 'asc' },
            include: {
                suppliers: {
                    include: { supplier: { select: { id: true, name: true } } }
                }
            }
        })

        const data = brands.map(b => ({
            id: b.id,
            name: b.name,
            suppliers: b.suppliers.map(sb => sb.supplier)
        }))

        return { ok: true, data }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener las marcas',
        })
    }
})
