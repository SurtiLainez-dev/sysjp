import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
    }>(event);

    if (!body.name) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan el nombre de la marca' })
    }


    const brand = await prisma.brands.create({
        data: {
            name: body.name
        },
    });

    return { ok: true, brand:brand.id }
})
