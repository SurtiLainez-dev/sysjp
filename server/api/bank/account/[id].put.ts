import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    try {
        const bank = await prisma.bank_accounts.update({
            where: { id },
            data: {
                number: body.number,
                nickname: body.nickname,
                bank_id:  body.bank_id,
                is_checking: body.is_checking
            },
        })
        return bank
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el número de cuenta' })
    }
})
