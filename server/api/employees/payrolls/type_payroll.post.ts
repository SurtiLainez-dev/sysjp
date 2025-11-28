import { prisma } from '@/server/utils/prisma'
import {createAccount} from "@/server/services/accounts";
import {getNextAccountCode} from "@/server/services/cod_accounts";


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
        effect: string
        otros_ingresos: boolean
    }>(event)

    if (!body.name || !body.effect) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }
    let type = 'EXPENSE';
    if (body.otros_ingresos)
        type = 'INCOME'

    const acct = await createAccount({
        code: await getNextAccountCode('PAYR', type),
        name: `CC Payroll Type ${body.name}`,
        type,
        isCash: false
    })


    if (body.effect === 'ADD'){
        const type_payroll = await prisma.type_payrolls.create({
            data: {
                name: body.name,
                effect: body.effect,
                default_debit_account_id: acct.id,
            }
        })
    }else{
        const type_payroll = await prisma.type_payrolls.create({
            data: {
                name: body.name,
                effect: body.effect,
                default_credit_account_id: acct.id,
            }
        })
    }


    return { ok: true}
})
