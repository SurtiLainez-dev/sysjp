import { prisma } from '@/server/utils/prisma'
import { hashSecret, pinLookup } from '@/server/utils/crypto'

// Si no usas Zod, deja esta validación simple
function validatePin(pin: string) {
    const trimmed = String(pin ?? '').trim()
    if (!/^\d{4,6}$/.test(trimmed)) {
        throw createError({ statusCode: 400, statusMessage: 'El PIN debe ser numérico de 4 a 6 dígitos' })
    }
    return trimmed
}

export default defineEventHandler(async (event) => {
    // 1) Parámetro de ruta
    const idParam = getRouterParam(event, 'id')
    const userId = Number(idParam)
    if (!Number.isFinite(userId)) {
        throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
    }

    // 2) Body (pin nuevo)
    const body = await readBody<{ pin?: string | number }>(event)
    const pin = validatePin(String(body?.pin ?? ''))

    // 3) Verificar que el usuario existe y está ACTIVO
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, is_active: true }
    })
    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
    }
    if (!user.is_active) {
        throw createError({ statusCode: 409, statusMessage: 'El usuario está inactivo y no puede modificar su PIN' })
    }

    // 4) Validar unicidad del PIN (en otros usuarios)
    const lookup = pinLookup(pin)
    const pinTaken = await prisma.users.findFirst({
        where: {
            pin_lookup: lookup,
            NOT: { id: userId }     // <- otro usuario con el mismo pin
        },
        select: { id: true }
    })
    if (pinTaken) {
        throw createError({
            statusCode: 409,
            statusMessage: 'El PIN que ingresaste ya existe en otro usuario'
        })
    }

    // 5) Guardar HASH (bcrypt) y LOOKUP (HMAC)
    const passwordHash = await hashSecret(pin)

    const updated = await prisma.users.update({
        where: { id: userId },
        data: {
            password: passwordHash,
            pin_lookup: lookup
        },
        select: {
            id: true,
            username: true,
            is_admin: true,
            is_active: true
        }
    })

    return { ok: true, data: updated }
})
