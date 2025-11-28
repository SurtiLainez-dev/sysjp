import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const officeId = Number(getRouterParam(event, 'id'))
        console.log("is")
        console.log(officeId)

        if (!officeId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Se requiere el parámetro valido'
            })
        }

        const employees = await prisma.employees.findMany({
            where: {
                office_id: Number(officeId),
            },
            orderBy: { id: 'asc' }
        })

        return { ok: true, data: employees }
    } catch (err) {
        console.error(err)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno al obtener empleados por oficina'
        })
    }
})
