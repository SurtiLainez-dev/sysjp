import { verifyToken } from '@/server/utils/jwt'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'token')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    const payload = await verifyToken(token)
    return { username: payload.username, is_admin: payload.is_admin }
})
