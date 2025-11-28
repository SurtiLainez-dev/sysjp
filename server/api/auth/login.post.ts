import { prisma } from '@/server/utils/prisma'
import { pinLookup, verifySecret } from '@/server/utils/crypto'
import { signToken } from '@/server/utils/jwt'
export default defineEventHandler(async (event) => {
    const body = await readBody<{ pin?: string }>(event)
    const pin = (body?.pin || '').trim()
    if (!pin) throw createError({ statusCode: 400, statusMessage: 'PIN requerido' })

    const lookup = pinLookup(pin)
    const user = await prisma.users.findUnique({ where: { pin_lookup: lookup } })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'PIN inválido' })

    // doble verificación por si acaso
    const ok = await verifySecret(user.password, pin)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'PIN inválido' })

    const token = await signToken({ sub: String(user.id), username: user.username, is_admin: user.is_admin }, '88h')

    setCookie(event, 'token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',      // o 'strict' si no hay cross-site
        path: '/',
        maxAge: 60 * 60 * 88,
    })

    return { token }
})
