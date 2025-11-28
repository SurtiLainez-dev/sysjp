import { prisma } from '@/server/utils/prisma'
import {logArticleHistory} from "@/server/services/articleHistory";

export default defineEventHandler(async (event:any) => {
    const body = await readBody<{
        id: number,
        cost_prince: number,
        sale_price:  number,
        tax_ids:     [],
    }>(event);

    if (!body.id || !body.sale_price) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos' })
    }

    const tax_ids = Array.isArray(body?.tax_ids)
        ? body.tax_ids.map(Number).filter(Boolean)
        : []


    try {
        const editArticle = await prisma.articles.update({
            where: { id:body.id },
            data: {
                cost_price:body.cost_price,
                sale_price:body.sale_price,
            },
        });

        const existing = await prisma.articles_taxes.findMany({
            where: { article_id: body.id }
        })

        const existingMap = new Map(existing.map((e:any) => [e.tax_id, e]))

        const toActivate: number[]   = []
        const toCreate: number[]     = []
        const toDeactivate: number[] = []

        for (const taxId of tax_ids) {
            const record = existingMap.get(taxId)
            if (record) {
                // @ts-ignore
                if (!record.is_active) toActivate.push(record.tax_id)
            } else {
                toCreate.push(taxId)
            }
        }

        for (const record of existing) {
            if (record.is_active && !tax_ids.includes(record.tax_id)) {
                toDeactivate.push(record.tax_id)
            }
        }

        await prisma.$transaction(async (tx:any) => {
            // Crear los nuevos
            if (toCreate.length > 0) {
                await tx.articles_taxes.createMany({
                    data: toCreate.map(tax_id => ({
                        article_id: body.id,
                        tax_id,
                        is_active: true
                    })),
                    skipDuplicates: true
                })
            }

            // Activar los que estaban inactivos
            if (toActivate.length > 0) {
                await tx.articles_taxes.updateMany({
                    where: {
                        article_id: body.id,
                        tax_id: { in: toActivate }
                    },
                    data: { is_active: true }
                })
            }

            // Desactivar los que ya no están
            if (toDeactivate.length > 0) {
                await tx.articles_taxes.updateMany({
                    where: {
                        article_id: body.id,
                        tax_id: { in: toDeactivate }
                    },
                    data: { is_active: false }
                })
            }

            await logArticleHistory(body.id,'Actualizó precio de costo/venta y sincronizó impuestos.')
        })

        return { ok: true, data: tax_ids }
    }catch (err){
        throw createError({ statusCode: 500, statusMessage: 'Error al actualizar el precio' })
    }

})

const createArticleTax = async (idTax:number, idArt:number) => {
  await prisma.articles_taxes.create({
      data:{
          article_id: idArt,
          tax_id:     idTax,
          is_active:  true
      }
  })
}

const queryExistTaxInArticleTax = async (idTax:number, idArt: number)=>{
    return await prisma.articles_taxes.findFirst({
        where:{tax_id:idTax, article_id: idArt}
    })
}

const queryUpdateArticleTax = async (idArtTax:number, status:boolean)=>{
    prisma.articles_taxes.update({
        where:{id:idArtTax},
        data:{
            is_active: status
        }
    })
}
