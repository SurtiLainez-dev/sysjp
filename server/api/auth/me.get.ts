import { prisma } from '@/server/utils/prisma'
import { verifyToken } from '@/server/utils/jwt'

interface JWTPayload {
    sub?: string
    id?: number
    username?: string
    is_admin?: boolean
}

export default defineEventHandler(async (event) => {
    // 0. Marca de inicio
    console.log('[auth/me] Nueva petición')

    // 1. Leer token desde cookie
    const token = getCookie(event, 'token')
    console.log("token", token)
    if (!token) {
        console.warn('[auth/me] No se encontró cookie "token"')
        throw createError({
            statusCode: 401,
            statusMessage: 'No autorizado',
            message: 'No se encontró el token de sesión.',
        })
    }

    console.log(
        '[auth/me] Token recibido (primeros 20 chars):',
        token.slice(0, 20) + '...'
    )

    // 2. Verificar token con tu helper
    let payload: JWTPayload | null = null
    console.log("esto es payload")
    console.log(payload)
    try {
        payload = (await verifyToken(token)) as JWTPayload | null
    } catch (err) {
        console.error('[auth/me] Error en verifyToken:', err)
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
            message: 'La sesión no es válida, por favor vuelve a iniciar sesión.',
        })
    }

    if (!payload) {
        console.warn('[auth/me] verifyToken devolvió null')
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
            message: 'La sesión no es válida, por favor vuelve a iniciar sesión.',
        })
    }

    console.log('[auth/me] Payload decodificado:', {
        sub: payload.sub,
        id: payload.id,
        username: payload.username,
        is_admin: payload.is_admin,
    })

    // 3. Sacar el id del payload (id o sub)
    const userId =
        payload.id ??
        (payload.sub ? Number(payload.sub) : NaN)

    if (!userId || Number.isNaN(userId)) {
        console.warn('[auth/me] userId inválido en payload:', {
            id: payload.id,
            sub: payload.sub,
        })
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
            message: 'El token no contiene un usuario válido.',
        })
    }

    console.log('[auth/me] Buscando usuario con id:', userId)

    // 4. Buscar el usuario en la BD
    const user = await prisma.users.findUnique({
        where: { id: userId },
    })

    if (!user) {
        console.warn('[auth/me] Usuario no encontrado en DB. id:', userId)
        throw createError({
            statusCode: 401,
            statusMessage: 'Usuario no encontrado',
            message: 'El usuario asociado al token ya no existe.',
        })
    }

    console.log('[auth/me] Usuario encontrado:', {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        is_active: (user as any).is_active,
    })

    // 5. Limpiar campos sensibles
    const { password, pin_lookup, ...publicUser } = user as any

    // 6. Devolver usuario
    console.log('[auth/me] Respuesta enviada OK para user id:', user.id)

    return {
        user: publicUser,
    }
})
