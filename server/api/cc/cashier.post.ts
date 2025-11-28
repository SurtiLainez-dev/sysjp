// server/api/cc/cajas.post.ts
// @ts-ignore
import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '@/server/utils/prisma'

async function nextCashCode() {
    // Trae el último code tipo CASH-#### y calcula el siguiente
    const last = await prisma.accounts.findFirst({
        where: { code: { startsWith: 'CASH-' } },
        orderBy: { code: 'desc' },
        select: { code: true },
    })

    let n = 1
    if (last?.code) {
        const m = last.code.match(/^CASH-(\d{4})$/)
        if (m) n = Number(m[1]) + 1
    }
    return `CASH-${String(n).padStart(4, '0')}`
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        office_id?: number
        user_id?: number
    }>(event)

    const office_id = Number(body?.office_id)
    const user_id = Number(body?.user_id)

    if (!office_id) throw createError({ statusCode: 400, statusMessage: 'office_id es requerido' })
    if (!user_id) throw createError({ statusCode: 400, statusMessage: 'user_id es requerido' })

    // 2..5) Transacción: validar, crear account y caja
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Oficina
            const office = await tx.offices.findUnique({ where: { id: office_id }, select: { id: true, name: true } })
            if (!office) throw createError({ statusCode: 404, statusMessage: 'La sucursal (office) no existe' })

            // Usuario
            const user = await tx.users.findUnique({ where: { employee_id: user_id }, select: { id: true, username: true, is_active: true } })
            if (!user) throw createError({ statusCode: 404, statusMessage: 'El usuario no existe' })
            if (user.is_active === false) throw createError({ statusCode: 400, statusMessage: 'El usuario está inactivo' })

            // Solo 1 caja por sucursal (activa)
            const already = await tx.cashiers.findFirst({
                where: { office_id, is_active: true },
                select: { id: true},
            })
            if (already) {
                throw createError({
                    statusCode: 409,
                    statusMessage: `La sucursal ya tiene una caja activa (${already.name})`,
                })
            }

            // Crear primero la cuenta contable (ASSET, is_cash = true)
            const code = await nextCashCode()
            const accountName = `Cashier - ${office.name}`

            const account = await tx.accounts.create({
                data: {
                    code,
                    name: accountName,
                    type: 'ASSET',      // enum AccountType
                    is_cash: true,
                    // parent_id: null, // si quieres colgarla de una cuenta padre, pásala aquí
                },
                select: { id: true, code: true, name: true, type: true, is_cash: true },
            })

            // Crear la caja (sin pin, total inicia 0.00)
            const cashier = await tx.cashiers.create({
                data: {
                    office_id,
                    user_id,
                    account_id: account.id,
                    // total: 0.00 // tu modelo ya tiene default 0.00
                },
                include: {
                    office: { select: { id: true, name: true } },
                    user:   { select: { id: true, username: true } },
                    account:{ select: { id: true, code: true, name: true, type: true } },
                },
            })

            return { account, cashier }
        })

        return { ok: true, ...result }
    } catch (err: any) {
        // Si createError fue lanzado dentro de la transacción, h3 lo respeta.
        if (err?.statusCode) throw err
        console.error('cc/cajas.post error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Error interno al crear la caja' })
    }
})
