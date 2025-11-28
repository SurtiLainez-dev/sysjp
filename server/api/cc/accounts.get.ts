import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event:any) => {
    try {
        const accounts = await prisma.accounts.findMany({
            orderBy: { id: 'asc' },
            include: {
                parent: true
            }
        })
        return { ok: true, data: accounts }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener las cuentas contables',
        })
    }
})
