import { prisma } from '@/server/utils/prisma'
import {getNextAccountCode} from "@/server/services/cod_accounts";
export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string,
        rate: number,

    }>(event);

    if (!body.name || !body.rate) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const acc = await prisma.accounts.findUnique({
        where: { code: '2000' },
        select: { id: true, type: true },
    });


    const ccTax = await prisma.accounts.create({
        data: {
            code: await getNextAccountCode('LIABILITY','LIABILITY'),
            name: 'TAX - '+body.name,
            type: 'LIABILITY',
            parent_id: acc.id,
            is_cash: false,
        },
    })

    const tax = await prisma.taxes.create({
        data: {
            name: body.name,
            rate: body.rate,
            active: true,
            account_id: ccTax.id
        },
    });

    return { ok: true, tax: tax }
})
