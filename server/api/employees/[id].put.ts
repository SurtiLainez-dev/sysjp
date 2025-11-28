import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }


    try {
        const employee = await prisma.employees.update({
            where: { id },
            data: {
                name: body.name,
                phone: body.phone,
                typeEmployee_id: body.typeEmployee_id,
                office_id: body.office_id,
            },
        })
        return employee
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el empleado' })
    }
})
