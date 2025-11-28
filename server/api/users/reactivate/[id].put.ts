import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const { id } = getRouterParams(event)
        if (!id) {
            throw createError({ statusCode: 400, statusMessage: 'ID requerido' })
        }

        const user = await prisma.users.update({
            where: { id: Number(id) },
            data: {
                is_active:  true
            },
        })

        return { ok: true, data: user }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al reactivat el usuario' })
    }
})
