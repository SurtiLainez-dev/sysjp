import { prisma} from '@/server/utils/prisma'
import type { AccountType } from '@/server/utils/prisma'

type CreateAccountOptions = {
    code: string
    name: string
    type: AccountType
    parentId?: number
    isCash?: boolean
}

export async function createAccount({code, name, type, parentId, isCash = false}: CreateAccountOptions) {
    const acct = await prisma.accounts.create({
        data: {
            code,
            name,
            type,
            parent_id: parentId,
            is_cash: isCash
        }
    })
    return acct
}
