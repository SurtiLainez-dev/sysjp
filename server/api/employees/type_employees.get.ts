import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    try {
        const type_employees = await prisma.type_employees.findMany({
            orderBy: { id: 'asc' }
        })
        return { ok: true, data: type_employees }
    } catch (err) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener los tipos de colaboradores',
        })
    }
})
