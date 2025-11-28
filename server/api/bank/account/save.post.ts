import { prisma } from '@/server/utils/prisma'
import {createAccount} from "@/server/services/accounts";
import {getNextAccountCode} from "@/server/services/cod_accounts";


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        num: string
        nickname: string
        bank_id: number
        is_checking: boolean
    }>(event)

    if (!body.num || !body.nickname || !body.bank_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const acct = await createAccount({
        code: await getNextAccountCode('BANK', 'ASSET'),
        name: `CC Banco ${body.nickname}`,
        type: 'ASSET',
        isCash: true
    })

    const account = await prisma.bank_accounts.create({
        data: {
            number:      body.num,
            nickname:    body.nickname,
            bank_id:     body.bank_id,
            is_checking: body.is_checking,
            account_id:  acct.id
        }
    })



    return { ok: true, officeId: account.id }
})
