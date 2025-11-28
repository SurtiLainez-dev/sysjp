import { prisma} from '@/server/utils/prisma'


type CreatePayrollOptions = {
    office_id:      number,
    employee_id: number,
    year:           number,
    month:          number,
    start:          number,
    end:            number,
    deducciones:    number,
    agregados:      number,
    total:          number,
    items:          ItemPayrollInterfaz[],
    payType:        string,
    bankAccount?:   number,
    notes:          string
}

interface ItemPayrollInterfaz{
    type_payroll_id: number,
    description: string,
    amount: number
}

export async function createPayroll({office_id, employee_id, year, month, start, end, deducciones, agregados, total, items,payType,bankAccount, notes}:CreatePayrollOptions){
    const payroll = await prisma.payrolls.create({
        data: {
            employee_id,
            year,
            month,
            start_period: start,
            end_period: end,
            gross_total: agregados,
            deductions_total: deducciones,
            net_total: total,
            bank_account_id: bankAccount,
            type_pay: payType,
            office_id,
            notes
        }
    });

    items.forEach((item)=>{
        creatItemsPayroll(item, payroll.id)
    })

    return payroll
}

const creatItemsPayroll = async (item:ItemPayrollInterfaz, payroll_id: number)=>{
    return prisma.payroll_items.create({
        data: {
            payroll_id:      payroll_id,
            type_payroll_id: item.type_payroll_id,
            description:     item.description ?? null,
            amount:          item.amount
        }
    })
}
