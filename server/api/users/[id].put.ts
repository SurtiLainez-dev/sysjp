import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    try {
        const user = await prisma.users.update({
            where: { id },
            data: {
                username: body.username,
            },
        })
        return user
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el usuario' })
    }
})
