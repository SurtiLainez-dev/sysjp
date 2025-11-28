import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    try {
        const office = await prisma.offices.update({
            where: { id },
            data: {
                name: body.name,
                nickname: body.nickname,
                email: body.email,
                phone: body.phone,
                address: body.address,
            },
        })
        return office
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar oficina' })
    }
})
