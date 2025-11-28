import { prisma} from '@/server/utils/prisma'

type CreateTransaction = {
    memo: string,
    source: 'SALES'|'PAYROLL'|'PURCHASE'|'MANUAL'|'CARD',
    ref: string,
    type: 'MANUAL'| 'PURCHASE'| 'PAYROLL'| 'SALES'| 'CARD'| 'BANK_TRANSFER',
    office_id: number,
    lines: TransactionLinesInterfaz[],
}
interface TransactionLinesInterfaz{
    account_id:  number,
    amount: number,
    type: 'DEBIT' | 'CREDIT'
}
export async function createTransaction({memo, source, ref, type,office_id, lines}:CreateTransaction){
    let cod = await getCode();

    const transaction = await prisma.transactions.create({
        data: {
            date: new Date(),
            memo: memo,
            source: source,
            ref: ref,
            type: type,
            office_id: office_id,
            cod: cod,
        }
    })

    const debits  = lines.filter((line: TransactionLinesInterfaz) => line.type === 'DEBIT')
    const credits = lines.filter((line: TransactionLinesInterfaz) => line.type === 'CREDIT')

    for (const line of debits) {
        await addLineInTrasaction(line, transaction.id)
    }

    for (const line of credits) {
        await addLineInTrasaction(line, transaction.id)
    }

    return transaction;
}

const addLineInTrasaction = async (line:TransactionLinesInterfaz, transaction_id:number)=>{
    let debit = 0, credit = 0;
    if (line.type === 'DEBIT')
        debit = line.amount
    else
        credit = line.amount
    console.log("aca esta addLine")
    console.log(line)
    return await prisma.transaction_lines.create({
        data:{
            transaction_id: transaction_id,
            account_id:     line.account_id,
            debit:          debit,
            credit:         credit
        }
    })
}

const getCode = async ()=>{
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const count = await prisma.transactions.count({
        where: {
            date: {
                gte: today,
                lt: tomorrow,
            },
        },
    })
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${count + 1}`
}
