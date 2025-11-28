import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string

    }>(event)

    if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const type_employee = await prisma.type_employees.create({
        data: {
            name:            body.name,
        }
    })

    return { ok: true, officeId: type_employee.id }
})
