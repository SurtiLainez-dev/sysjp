import { prisma } from '@/server/utils/prisma'
import {getGenericCode} from "@/server/services/cod_accounts";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string,
        description: number,
    }>(event);

    if (!body.name || !body.description) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const cat = await prisma.categories.create({
        data: {
            name: body.name,
            description: body.description,
            code: getGenericCode('',await prisma.categories.count())
        },
    });

    return { ok: true, data: cat }
})
