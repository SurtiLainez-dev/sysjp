import { prisma } from '@/server/utils/prisma'
import { pinLookup, verifySecret } from '@/server/utils/crypto'
import { signToken } from '@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ pin?: string }>(event)
    const pin = (body?.pin || '').trim()

    if (!pin) {
        throw createError({
            statusCode: 400,
            statusMessage: 'PIN requerido',
            message: 'Debes ingresar un PIN.',
        })
    }

    const lookup = pinLookup(pin)

    const user = await prisma.users.findUnique({
        where: { pin_lookup: lookup },
    })

    if (!user) {
        // Usuario no encontrado para ese PIN
        throw createError({
            statusCode: 404,
            statusMessage: 'Usuario no encontrado',
            message: 'No existe un usuario asociado a este PIN.',
        })
    }

    // Doble verificación del PIN contra el hash
    const ok = await verifySecret(user.password, pin)
    if (!ok) {
        throw createError({
            statusCode: 401,
            statusMessage: 'PIN inválido',
            message: 'El PIN ingresado es incorrecto.',
        })
    }

    // Payload del token: incluimos sub y id explícito
    const token = await signToken(
        {
            sub: String(user.id),
            id: user.id,
            username: user.username,
            is_admin: user.is_admin,
        },
        '88h',
    )

    // IMPORTANTE: secure:true solo funcionará bien cuando tengas HTTPS
    setCookie(event, 'token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 88, // 88 horas
    })

    // Devolver usuario sin datos sensibles
    const { password, pin_lookup, ...publicUser } = user as any

    return {
        token,
        user: publicUser,
    }
})
