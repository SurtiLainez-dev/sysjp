import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    try {
        const bank = await prisma.banks.update({
            where: { id },
            data: {
                name: body.name,
            },
        })
        return bank
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el banco' })
    }
})
