import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event:any) => {
    const body = await readBody<{
        name: string,
        is_cash: boolean,
        account_id?: number
    }>(event)

    if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const payment_method = await prisma.payment_methods.create({
        data: {
            name: body.name,
            is_cash: body.is_cash,
        }
    })

    return { ok: true, payment: payment_method.id }
})
