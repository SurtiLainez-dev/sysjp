import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const arts = await prisma.articles.findMany({
            orderBy: { id: 'asc' },
            include:{
                category: true,
                brand:    true,
                taxes:    {
                    where:{is_active: true},
                    include:{
                        tax: true
                    }
                }
            }
        })
        return { ok: true, data: arts }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener los articulos',
        })
    }
})
