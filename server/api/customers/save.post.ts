import { prisma } from '@/server/utils/prisma'


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
        phone: string
        email: string
        address?: string
        nickname?: string
    }>(event)

    if (!body.name || !body.phone || !body.email) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const exists = await prisma.customers.findFirst({
        where: {
            OR: [
                { email: body.email.toLowerCase() },
                { phone: body.phone }
            ]
        },
        select: { id: true }
    })

    if (exists) {
        throw createError({
            statusCode: 409,
            statusMessage: 'El telefono o el correo ya estan asociados a otro cliente'
        })
    }

    const customer = await prisma.customers.create({
        data: {
            name:     body.name,
            phone:    body.phone,
            email:    body.email,
            nickname: body.nickname,
            address:  body.address,
        }
    })

    return { ok: true, data: 'customer' }
})
