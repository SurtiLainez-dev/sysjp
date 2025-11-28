import { prisma } from '@/server/utils/prisma'
import {getNextAccountCode} from "@/server/services/cod_accounts";


export default defineEventHandler(async (event) => {
    const body = await readBody<{
        name: string
        nickname: string
        email: string
        phone: string
        address: string
    }>(event);

    if (!body.name || !body.nickname || !body.phone || !body.address) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const acc = await prisma.accounts.findUnique({
        where: { code: '2010' },
        select: { id: true, type: true },
    });
    let accId;
    if (!acc) {
        const newAcc = await registrarAccountsPasivo();
        accId = newAcc.child.id;
    }else
        accId = acc.id

    const proveedorCC = await prisma.accounts.create({
        data: {
            code: await getNextAccountCode('LIABILITY','LIABILITY'),
            name: body.name,
            type: 'LIABILITY',
            parent_id: acc.id,
            is_cash: false,
        },
    });

    const proveedor = await prisma.suppliers.create({
        data: {
            fullname:   body.name,
            name:       body.nickname,
            phone:      body.phone,
            email:      body.email,
            address:    body.address,
            account_id: proveedorCC.id
        },
    });

    return { ok: true, proveedorId:proveedor.id }
})

const registrarAccountsPasivo = async ()=>{
    const parent = await prisma.accounts.create({
        data: {
            code: '2000',
            name: 'Current Liabilities',
            type: 'LIABILITY',
            parent_id: null,
            is_cash: false,
        },
    });

    const child = await prisma.accounts.create({
        data: {
            code: '2010',
            name: 'Accounts Payable - Suppliers',
            type: 'LIABILITY',
            parent_id: parent.id,
            is_cash: false,
        }
    });

    return { parent, child };
}
