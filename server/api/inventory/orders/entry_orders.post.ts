import { prisma } from '@/server/utils/prisma'
import {logArticleHistory} from "@/server/services/articleHistory";

type ItemInput = {
    id: number;
    is_cc: boolean;
    quantity: number;
    unit_cost: number;
    subtotal?: number;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        code: string
        supplier_id?: number
        office_id: number
        date?: string
        notes?: string
        items: ItemInput[],
        total: number,
        disccount?: number
    }>(event);

    if (!body?.office_id) {
        throw createError({ statusCode: 400, statusMessage: 'La oficina es requerido' })
    }
    if (!body?.code) {
        throw createError({ statusCode: 400, statusMessage: 'La referencia del documento es requerido' })
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Las filas de la orden son requerias y no puede estar vacío' })
    }

    const normalizedItems: ItemInput[] = body.items.map((it) => {
        return {
            id: Number(it.id),
            is_cc: !!it.is_cc,
            quantity: Number(it.quantity) || 0,
            unit_cost: Number(it.unit_cost) || 0,
            subtotal: Number(it.subtotal)
        }
    })

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1) Crear cabecera de la orden de entrada
            const entryOrder = await tx.entry_orders.create({
                data: {
                    code: body.code,
                    supplier_id: body.supplier_id ?? null,
                    branch_id: body.office_id,
                    date: body.date ? new Date(body.date) : new Date(),
                    total_amount: body.total,
                    notes: body.notes ?? null,
                    is_invoiced: false,
                    is_posted: false,
                    disccount: body.disccount
                },
                select: { id: true, code: true, branch_id: true }
            })

            await tx.entry_order_details.createMany({
                data: normalizedItems.map(it => ({
                    entry_order_id: entryOrder.id,
                    article_id: it.id,
                    quantity: it.quantity,
                    unit_cost: it.unit_cost,
                    subtotal: it.subtotal
                }))
            })

            for (const it of normalizedItems) {
                if (!it.is_cc) continue
                if (it.quantity <= 0) continue

                await tx.article_stocks.upsert({
                    where: {
                        branch_id_article_id: {
                            branch_id: entryOrder.branch_id,
                            article_id: it.id
                        }
                    },
                    update: {
                        stock: { increment: it.quantity }
                    },
                    create: {
                        branch_id: entryOrder.branch_id,
                        article_id: it.id,
                        stock: it.quantity
                    }
                })

                await logArticleHistory(it.id,'El articulo ha sido mencionado en la orden de #'+entryOrder.id)
            }

            return entryOrder
        })

        return {
            ok: true,
            message: 'La orden ha sido creada exitosamente',
            entry_order: result,
        }
    } catch (err: any) {
        // Puedes mapear errores de unique code en `code` si lo hiciste @unique
        throw createError({
            statusCode: 500,
            statusMessage: err?.message ?? 'Error al crear la orden de entrada'
        })
    }
})
