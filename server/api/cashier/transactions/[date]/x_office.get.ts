// server/api/cashier/transaction/[date]/x_office.get.ts
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const auth = (event.context as any).auth
    if (!auth?.user) {
        throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    }

    const dateParam = getRouterParam(event, 'date')

    if (!dateParam) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Parámetros date y office_id son requeridos'
        })
    }

    const officeId = Number(auth.user.office_id)
    if (!Number.isFinite(officeId)) {
        throw createError({ statusCode: 422, statusMessage: 'office_id inválido' })
    }

    // (Opcional) validar que solo vea su propia oficina si no es admin
    if (!auth.user.is_admin && auth.user.office_id !== officeId) {
        throw createError({ statusCode: 403, statusMessage: 'No puede ver otra oficina' })
    }

    // Rango del día [00:00, 23:59:59]
    const start = new Date(`${dateParam}T00:00:00`)
    const end   = new Date(`${dateParam}T23:59:59.999`)

    // 1) Obtener cajas de esa oficina
    const cashiers = await prisma.cashiers.findMany({
        where: { office_id: officeId },
        select: { id: true }
    })

    const cashierIds = cashiers.map(c => c.id)
    if (!cashierIds.length) {
        return { ok: true, data: [] }
    }

    // 2) Traer transacciones de caja del día para esas cajas
    const rows = await prisma.cashier_transactions.findMany({
        where: {
            cashier_id: { in: cashierIds },
            created_at: {
                gte: start,
                lt: end
            }
        },
        include: {
            user: {
                select: { id: true, username: true }
            },
            payment_method: {
                select: { id: true, name: true, is_cash: true }
            }
        },
        orderBy: { created_at: 'asc' }
    })

    // 3) Mapear a DTO para el front
    const data = rows.map(r => ({
        id: r.id,
        // hora legible
        time: r.created_at.toISOString(),
        type: r.type,                         // CashierTxnType
        amount: Number(r.amount),            // total de la transacción
        user: {
            id: r.user.id,
            username: r.user.username
        },
        payment_method: r.payment_method
            ? {
                id: r.payment_method.id,
                name: r.payment_method.name,
                is_cash: r.payment_method.is_cash
            }
            : null,
        receipt_id: r.receipt_id ?? null,
        note: r.note ?? null
    }))

    return { ok: true, data }
})
