import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event:any) => {
    try {
        const idParam = getRouterParam(event, 'sku')
        const sku = idParam

        if (!sku) {
            throw createError({ statusCode: 400, statusMessage: 'Parámetro id inválido' })
        }

        const article = await prisma.articles.findFirst({
            where: { sku },
            include: {
                brand: {
                    include:{
                        suppliers: {
                            include:{
                                supplier: true
                            }
                        }
                    }
                },
                category: true,
                taxes: {
                    include: {
                        tax: true
                    }
                },
                history: {
                    orderBy: { created_at: 'desc' }
                }
            }
        })

        if (!article) {
            throw createError({ statusCode: 404, statusMessage: 'Artículo no encontrado' })
        }

        const flatTaxes = article.taxes.map((at:any) => at.tax)
        const suppliers = article.brand.suppliers.map((item:any)=>item.supplier)

        return {
            ok: true,
            data: {
                ...article,
                taxes_pivot: article.taxes,
                taxes: flatTaxes,
                suppliers
            }
        }
    } catch (err: any) {
        throw createError({
            statusCode: err?.statusCode ?? 500,
            statusMessage: err?.statusMessage ?? 'Error interno al obtener el artículo',
        })
    }
})
