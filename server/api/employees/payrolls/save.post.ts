import { prisma } from '@/server/utils/prisma'
import {createPayroll} from "@/server/services/payroll";
import {createTransaction} from "@/server/services/register_transaction";



export default defineEventHandler(async (event:any) => {
    const body = await readBody<{
        office_id:      number
        colaborador_id: string
        year:           number
        month:          string
        start_period:   number,
        end_period:     number,
        deducciones:    number,
        agregados:      number,
        total:          number,
        payType:        string,
        bankAccount:    number,
        notas:          string,
        items:          [],
        accounts:       []
    }>(event)

    if (!body.office_id || !body.colaborador_id || !body.year || !body.month || !body.start_period || !body.end_period
    || !body.agregados || !body.total || !body.payType || !body.bankAccount || !body.notas) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const payroll = await createPayroll({
        office_id:   body.office_id,
        employee_id: body.colaborador_id,
        year:        body.year,
        month:       body.month,
        start:       body.start_period,
        end:         body.end_period,
        deducciones: body.deducciones,
        agregados:   body.agregados,
        total:       body.total,
        payType:     body.payType,
        bankAccount: body.bankAccount,
        notes:       body.notas,
        items:       body.items,
    })

    const createPay = await createTransaction({
        memo:      'PAYMENT OF PAYROLL NOTE: '+body.notas,
        source:    'PAYROLL',
        ref:       'PAYROLL #'+payroll.id,
        type:      'PAYROLL',
        office_id: body.office_id,
        lines:     body.accounts,
    })

    await prisma.payrolls.update({
        where: { id: payroll.id },
        data: {
            transaction_id: createPay.id
        }
    })



    return {ok:true, payrollId: payroll.id}

})
