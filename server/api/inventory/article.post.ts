import { prisma } from '@/server/utils/prisma'
import {getGenericCode} from "@/server/services/cod_accounts";

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string,
        description: number,
        brand_id:    number,
        category_id: number,
        model?:      string,
        bar_codde?:  string,
        is_cc:       boolean
    }>(event);

    if (!body.name || !body.brand_id || !body.category_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const art = await prisma.articles.create({
        data: {
            name: body.name,
            description: body.description,
            sku: getGenericCode('ART-',await prisma.articles.count()),
            brand_id: body.brand_id,
            category_id: body.category_id,
            model_code:  body.model,
            bar_code:    body.bar_code,
            cost_price:  0,
            sale_price:  0,
            is_cc:       body.is_cc
        },
    });

    return { ok: true, data: art }
})
