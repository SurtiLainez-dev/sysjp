import { prisma } from '@/server/utils/prisma'


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
        nickname: string
        email?: string
        phone: string
        address: string
    }>(event)

    if (!body.name || !body.nickname || !body.phone || !body.address) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const oficce = await prisma.offices.create({
        data: {
            name:        body.name,
            nickname:    body.nickname,
            email:       body.email,
            phone:       body.phone,
            address:     body.address,
        }
    })

    return { ok: true, officeId: oficce.id }
})
