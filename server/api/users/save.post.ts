import { prisma } from '@/server/utils/prisma'
import { hashSecret, pinLookup } from '~/server/utils/crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        username: string
        password: string
        is_admin?: boolean
        employee_id: number
    }>(event)

    if (!body?.username || !body?.password || !body?.employee_id) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos requeridos' })
    }
    const username   = body.username
    const pin        = body.password
    const employeeId = Number(body.employee_id)

    const employee = await prisma.employees.findUnique({
        where: { id: employeeId },
        include: { user: true },
    })
    if (!employee) {
        throw createError({ statusCode: 404, statusMessage: 'Colaborador no encontrado' })
    }
    if (employee.user) {
        throw createError({
            statusCode: 409,
            statusMessage: 'El colaborador ya tiene un usuario',
        })
    }

    const lookup = pinLookup(pin)
    const pinTaken = await prisma.users.findFirst({
        where: { pin_lookup: lookup },
        select: { id: true },
    })
    if (pinTaken) {
        throw createError({
            statusCode: 409,
            statusMessage: 'El PIN que ingresaste ya existe en otro usuario',
        })
    }

    // Hashear clave y pin
    const passwordHash = await hashSecret(body.password) // bcrypt
    const lookupuser = pinLookup(body.password)

    const user = await prisma.users.create({
        data: {
            username:    body.username,
            password:    passwordHash,
            pin_lookup:  lookupuser,
            is_admin:    body.is_admin,
            employee_id: body.employee_id,
            is_active:   true
        }
    })

    return { ok: true, userId: user.id }
})
