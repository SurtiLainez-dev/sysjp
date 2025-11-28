import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const users = await prisma.users.findMany({
            orderBy: { id: 'asc' },
            include: {
                employee: {
                    select: {
                        name: true,
                        office: {
                            select: { id: true }
                        }
                    }
                },
            }
        })
        return { ok: true, data: users }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener oficinas',
        })
    }
})
