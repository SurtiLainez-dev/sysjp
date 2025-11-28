import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async () => {
    try {
        const employees = await prisma.employees.findMany({
            orderBy: { id: 'asc' },
            include: {
                office: {
                    select: { name: true}
                },
                typeEmployee: {
                    select: { name: true }
                },
            }
        })

        return { ok: true, data: employees }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error interno al obtener empleados' })
    }
})
