import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const brand_id = Number(body?.brand_id)
        const supplier_id = Number(body?.supplier_id)

        if (!brand_id || !supplier_id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'La marca y el proveedor son requeridos (números).',
            })
        }

        const [brand, supplier] = await Promise.all([
            prisma.brands.findUnique({ where: { id: brand_id }, select: { id: true, name: true } }),
            prisma.suppliers.findUnique({ where: { id: supplier_id }, select: { id: true, name: true } }),
        ])

        if (!brand) {
            throw createError({ statusCode: 404, statusMessage: `Brand ${brand_id} no existe.` })
        }
        if (!supplier) {
            throw createError({ statusCode: 404, statusMessage: `Supplier ${supplier_id} no existe.` })
        }


        const already = await prisma.suppliers_brands.findFirst({
            where: { brand_id, supplier_id },
            select: { brand_id: true, supplier_id: true },
        })
        if (already) {
            throw createError({
                statusCode: 409,
                statusMessage: 'La relación proveedor-marca ya existe.',
            })
        }

        // 3) Crear vínculo en la pivote
        const link = await prisma.suppliers_brands.create({
            data: { brand_id, supplier_id },
        })

        return {
            ok: true,
            message: 'Relación creada correctamente.',
            data: {
                brand,
                supplier,
                link,
            },
        }
    } catch (err) {
        throw createError({
            statusCode: (err as any)?.statusCode ?? 500,
            statusMessage:
                (err as any)?.statusMessage ?? 'Error interno al vincular supplier con brand',
        })
    }
})
