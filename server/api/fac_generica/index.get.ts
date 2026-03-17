import { prisma } from "../../utils/prisma"
import { defineEventHandler, getQuery, createError } from "h3"

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)

        const page = Number(query.page || 1)
        const limit = Number(query.limit || 20)
        const skip = (page - 1) * limit

        const [rows, total] = await Promise.all([
            prisma.facGenerica.findMany({
                orderBy: {
                    id: "desc",
                },
                skip,
                take: limit,
                include: {
                    cuerpo: true,
                },
            }),
            prisma.facGenerica.count(),
        ])

        return {
            ok: true,
            data: rows,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error?.message || "Error al consultar facturas",
        })
    }
})
