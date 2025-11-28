import { prisma } from '@/server/utils/prisma'
import {logArticleHistory} from "@/server/services/articleHistory";

export default defineEventHandler(async (event:any) => {
    const sku = getRouterParam(event, 'sku')
    const body = await readBody(event)

    if (!sku) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }
    try {
        const artId = await prisma.articles.findFirst({
            where:{sku}
        })
        const editArt = await prisma.articles.update({
            where: { id:artId.id },
            data: {
                name: body.name,
                description: body.description,
                model_code: body.model_code,
                bar_code: body.bar_code,
                is_cc: body.is_cc,
                category_id: body.category_id
            },
        })
        await logArticleHistory(artId.id,'Se actualizaron los datos del articulo')
        return editArt;

    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el empleado' })
    }
})
