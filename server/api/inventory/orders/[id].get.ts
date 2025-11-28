import { prisma } from '@/server/utils/prisma'

    export default defineEventHandler(async (event:any) => {
    const { id } = getRouterParams(event)
    const orderId = Number(id)

    if (!orderId || Number.isNaN(orderId)) {
        throw createError({ statusCode: 400, statusMessage: 'Id invalido, orden no encontrada' })
    }

    try {
        const order = await prisma.entry_orders.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                code: true,
                date: true,
                total_amount: true,
                notes: true,
                is_invoiced: true,
                is_posted: true,
                created_at: true,
                updated_at: true,

                // Oficina (branch/offices)
                branch: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    }
                },

                // Proveedor
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        fullname: true,
                        phone: true,
                        email: true,
                        address: true,
                    }
                },

                // Detalles
                details: {
                    select: {
                        id: true,
                        article_id: true,
                        quantity: true,
                        unit_cost: true,
                        subtotal: true,

                        // Artículo
                        article: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                sku: true,
                                bar_code: true,
                                cost_price: true,
                                sale_price: true,
                                is_cc: true,
                                photo: true,

                                // Marca
                                brand: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { id: 'asc' }
                }
            }
        })

        if (!order) {
            throw createError({ statusCode: 404, statusMessage: 'Order not found' })
        }

        return {
            ok: true,
            data: {
                ...order,
            }
        }
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            statusMessage: err?.message ?? 'Error en el servidor al cargar los datos de la orden de entrada'
        })
    }
})
