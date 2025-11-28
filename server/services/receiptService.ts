// server/services/receiptService.ts
import { prisma } from '@/server/utils/prisma'

type TaxInput = {
    tax_id: number
    name: string
    rate: number // ej: 0.043
}

type ItemInput = {
    article_id: number
    name: string
    qty: number
    unit_price: number   // sin impuestos
    taxes: TaxInput[]
}

export type CreateReceiptDTO = {
    cashier_id: number
    user_id: number
    customer_id?: number | null
    work_order_id?: number | null
    payment_method_id: number
    notes?: string | null
    items: ItemInput[],
    office_id: number
}

const num = (v: any) => Number.parseFloat(String(v || 0))

export async function createReceipt(dto: CreateReceiptDTO) {

    return prisma.$transaction(async (tx) => {
        // 1) Traer método de pago y caja
        const paymentMethod = await tx.payment_methods.findUnique({
            where: { id: dto.payment_method_id }
        })
        if (!paymentMethod) {
            throw new Error('Método de pago no encontrado')
        }

        const cashier = await tx.cashiers.findFirst({
            where: { id: dto.cashier_id },
            include: { office: true } // por si luego usas office_id
        })
        if (!cashier) {
            throw new Error('Caja no encontrada')
        }

        const isCash = paymentMethod.is_cash === true

        // 2) Calcular totales
        let subtotal = 0
        const taxesMap = new Map<number, { tax_id: number; name: string; rate: number; amount: number }>()
        const itemRows: any[] = []

        for (const it of dto.items) {
            const qty = num(it.qty)
            const unitPrice = num(it.unit_price)
            const line_subtotal = qty * unitPrice
            subtotal += line_subtotal

            let lineTaxTotal = 0

            for (const t of it.taxes || []) {
                const rate = num(t.rate)
                const taxAmount = line_subtotal * rate
                lineTaxTotal += taxAmount

                const prev = taxesMap.get(t.tax_id) || {
                    tax_id: t.tax_id,
                    name: t.name,
                    rate: t.rate,
                    amount: 0
                }
                prev.amount += taxAmount
                taxesMap.set(t.tax_id, prev)
            }

            itemRows.push({
                article_id: it.article_id,
                name: it.name,
                qty,
                unit_price: unitPrice,
                tax_amount: lineTaxTotal,
                line_subtotal,
                line_total: line_subtotal + lineTaxTotal
            })
        }

        const discount_total = 0 // si luego agregas descuentos, cámbialo
        const tax_total = Array.from(taxesMap.values()).reduce((acc, t) => acc + t.amount, 0)
        const total = subtotal + tax_total - discount_total

        if (total <= 0) {
            throw new Error('El total del recibo debe ser mayor a 0')
        }

        // 3) Crear recibo
        const receipt = await tx.receipts.create({
            data: {
                cashier_id: dto.cashier_id,
                user_id: dto.user_id,
                customer_id: dto.customer_id ?? null,
                work_order_id: dto.work_order_id ?? null,
                payment_method_id: dto.payment_method_id,
                subtotal,
                tax_total,
                discount_total,
                total,
                notes: dto.notes ?? null
            }
        })

        // 4) Items
        await tx.receipt_items.createMany({
            data: itemRows.map(r => ({
                ...r,
                receipt_id: receipt.id
            }))
        })

        // 5) Detalle de impuestos
        if (taxesMap.size) {
            await tx.receipt_taxes.createMany({
                data: Array.from(taxesMap.values()).map(t => ({
                    receipt_id: receipt.id,
                    tax_id: t.tax_id,
                    name: t.name,
                    rate: t.rate,
                    amount: t.amount
                }))
            })
        }

        // 6) Movimiento de caja (entrada)
        await tx.cashier_transactions.create({
            data: {
                cashier_id: dto.cashier_id,
                user_id: dto.user_id,
                type: 'ENTRY',
                amount: total,
                receipt_id: receipt.id,
                payment_method_id: dto.payment_method_id,
                note: 'Venta en caja'
            }
        })

        // 7) Actualizar balance de la caja si es efectivo
        if (isCash) {
            // Ajusta el campo: balance, current_balance, cash_amount… como lo tengas
            await tx.cashiers.update({
                where: { id: dto.cashier_id },
                data: {
                    balance: { increment: total } // CAMBIA "balance" si tu campo se llama distinto
                }
            })
        }

        // 8) Rebajar stock por cada artículo
        // Asumo tabla article_stocks con (article_id, office_id, qty)
        for (const it of dto.items) {
            const qty = num(it.qty)

            await tx.article_stocks.updateMany({
                where: {
                    article_id: it.article_id,
                    branch_id: dto.office_id   // caja pertenece a oficina
                },
                data: {
                    stock: { decrement: qty }
                }
            })
            // Si quieres impedir que quede negativo, lo podemos hacer con un check previo.
            await tx.article_historys.create({
                data: {
                    article_id: it.article_id,
                    description: `Salida de inventario por recibo #${receipt.id}: -${qty} unidades en oficina ${cashier.office_id}`
                }
            })
        }

        // 9) Asiento contable (placeholder bien marcado)
        // TODO: aquí va journal_entry + journal_entry_lines
        //  - Buscar paymentMethod.account_id
        //  - Por cada artículo, usar article.revenue_account_id
        //  - Por cada receipt_tax, usar taxes.account_id
        //
        // Ejemplo aproximado:
        //
        // const journal = await tx.journal_entries.create({
        //   data: {
        //     date: new Date(),
        //     description: `Recibo ${receipt.id}`,
        //     receipt_id: receipt.id,
        //     office_id: cashier.office_id,
        //     lines: {
        //       create: [
        //         // Débito caja/banco
        //         { account_id: paymentMethod.account_id, debit: total, credit: 0 },
        //         // Créditos ingresos + impuestos...
        //       ]
        //     }
        //   }
        // })

        // return receipt
    })
}
