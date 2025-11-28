import { prisma } from '@/server/utils/prisma'
export default defineEventHandler(async (event:any) => {
    try {
        const id = getRouterParam(event, 'id')
        if (!id) {
            return { ok: false, message: 'El id de la planilla es requerido' }
        }

        const payroll = await prisma.payrolls.findUnique({
            where: { id: Number(id) },
            include: {
                office: true,
                employee: true,
                bank_account:{
                    include: {
                        bank: true,
                        account: true
                    }
                },
                items: {
                    include: {
                        type: true
                    }
                },
                transaction:{
                    include:{
                        lines: {
                            include:{
                                account: true
                            }
                        }
                    }
                }
            }
        })

        if (!payroll) {
            return { ok: false, message: 'Planilla no encontrada' }
        }

        return { ok: true, data: payroll }
    } catch (err: any) {
        return { ok: false, message: 'Error en el servidor', error: err.message }
    }
})
