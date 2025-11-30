import { prisma } from '@/server/utils/prisma'
import { verifyToken } from '@/server/utils/jwt'

interface JWTPayload {
    sub?: string
    id?: number
    username?: string
    is_admin?: boolean
}

export default defineEventHandler(async (event) => {
    // 1. Leer token desde cookie
    const token = getCookie(event, 'token')
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autorizado',
            message: 'No se encontró el token de sesión.',
        })
    }

    // 2. Verificar token con tu helper
    let payload = (await verifyToken(token)) as JWTPayload | null

    if (!payload) {
        // verifyToken devolvió null → token inválido / expirado
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
            message: 'La sesión no es válida, por favor vuelve a iniciar sesión.',
        })
    }

    // 3. Sacar el id del payload (id o sub)
    const userId =
        payload.id ??
        (payload.sub ? Number(payload.sub) : NaN)

    if (!userId || Number.isNaN(userId)) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
            message: 'El token no contiene un usuario válido.',
        })
    }

    // 4. Buscar el usuario en la BD
    const user = await prisma.users.findUnique({
        where: { id: userId },
    })

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Usuario no encontrado',
            message: 'El usuario asociado al token ya no existe.',
        })
    }

    // 5. Limpiar campos sensibles
    const { password, pin_lookup, ...publicUser } = user as any

    // 6. Devolver usuario (igual estilo que login)
    return {
        user: publicUser,
    }
})
