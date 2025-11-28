// server/api/receipt.save.post.ts
import { createReceipt } from '@/server/services/receiptService'


export default defineEventHandler(async (event) => {
    try {
        const auth = (event.context as any).auth;
        const body = await readBody(event)

        // Validaciones básicas
        if (!body || !Array.isArray(body.items) || !body.items.length) {
            throw createError({ statusCode: 400, statusMessage: 'No hay items en el recibo' })
        }
        if (!body.payment_method_id) {
            throw createError({ statusCode: 400, statusMessage: 'Método de pago requerido' })
        }

        const dto = {
            office_id: auth.user.office_id,
            cashier_id: auth.user.cashier_id,
            user_id: auth.user.id,
            customer_id: body.customer_id ?? null,
            work_order_id: body.work_order_id ?? null,
            payment_method_id: body.payment_method_id,
            notes: body.notes ?? null,
            items: body.items.map((it: any) => ({
                article_id: it.article_id,
                name: it.name,
                qty: it.qty,
                unit_price: it.unit_price,
                taxes: (it.taxes || []).map((t: any) => ({
                    tax_id: t.tax_id ?? t.id,
                    name: t.name,
                    rate: t.rate
                }))
            }))
        }

        const receipt = await createReceipt(dto)

        return {
            ok: true,
            data: receipt
        }
    } catch (err: any) {
        console.error('Error en /api/receipt.save:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, statusMessage: 'Error al guardar el recibo' })
    }
})
