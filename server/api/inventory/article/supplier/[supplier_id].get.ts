import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event:any) => {
    const { supplier_id } = getRouterParams(event)
    const supplierId = Number(supplier_id)
    if (!supplierId || Number.isNaN(supplierId)) {
        throw createError({ statusCode: 400, statusMessage: 'Proveedor inválido' })
    }

    try {
        const articles = await prisma.articles.findMany({
            where: {
                brand: {
                    suppliers: {
                        some: { supplier_id: supplierId }
                    }
                }
            },
            include: {
                brand: { select: { id: true, name: true } },
                category: true,
            },
            orderBy: { id: 'asc' }
        })
        return { ok: true, data: articles }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener los articulos del proveedor',
        })
    }
})
