import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
    }>(event)

    if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const bank = await prisma.banks.create({
        data: {
            name: body.name,
        }
    })

    return { ok: true, officeId: bank.id }
})
