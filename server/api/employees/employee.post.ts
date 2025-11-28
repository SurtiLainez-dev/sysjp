import { prisma } from '@/server/utils/prisma'


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
        phone: string
        typeEmployee_id: number
        office_id: number
    }>(event)

    if (!body.name || !body.phone || !body.typeEmployee_id || !body.office_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const oficce = await prisma.employees.create({
        data: {
            name:            body.name,
            phone:           body.phone,
            typeEmployee_id: body.typeEmployee_id,
            office_id:       body.office_id,
        }
    })

    return { ok: true, officeId: oficce.id }
})
