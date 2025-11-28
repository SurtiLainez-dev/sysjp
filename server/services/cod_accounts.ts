import { prisma } from '@/server/utils/prisma'
import type { AccountType  } from '@/server/utils/prisma'

export async function getNextAccountCode(name:string,type: AccountType ) {
    const count = await prisma.accounts.count({
        where: { type }
    })

    let nextNumber = count + 1
    let code = `${name}-${nextNumber.toString().padStart(4, '0')}`

    while (true) {
        const exists = await prisma.accounts.findUnique({
            where: { code }
        })

        if (!exists) break
        nextNumber++
        code = `${name}-${nextNumber.toString().padStart(4, '0')}`
    }

    return code;
}

export function getGenericCode(before:string, number:number):string{
    let cod;
    if (number < 10)
        cod = '00000'+number;
    else if (number >= 10 && number < 100)
        cod = '0000'+number
    else if (number >=100 && number < 1000)
        cod = '000'+number
    else if (number >= 1000 && number < 10000 )
        cod = '00'+number;
    else if (number >= 10000 && number < 100000)
        cod = '0'+number;
    else
        cod = number.toString();

    return before+cod;
}
