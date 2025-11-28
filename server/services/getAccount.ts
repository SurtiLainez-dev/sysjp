import { prisma} from '@/server/utils/prisma'

export async function getAccount(id:number){
    const account = await prisma.accounts.findUnique({
        where: {id},
    })

    return account;
}

export async function getAccounts(ids: number[]){
    const accounts = await prisma.accounts.findMany({
        where: {
            id: { in: ids }
        },
    })

    return accounts;
}
