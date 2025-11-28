import type { H3Event } from 'h3'

export function requireUser(event: H3Event) {
    const user = (event.context as any).user
    if (!user) throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    return user as { sub: string; username: string; is_admin?: boolean }
}
