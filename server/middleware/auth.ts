// server/middleware/auth.global.ts
// Corre en TODAS las requests de servidor

import { verifyToken } from '~/server/utils/jwt'
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)

    // Solo proteger /api/**
    if (!url.pathname.startsWith('/api')) return

    // Rutas públicas (ajusta a tu gusto)
    const publicPaths = [
        '/api/auth/login',
        '/api/auth/logout',
    ]
    if (publicPaths.some(p => url.pathname.startsWith(p))) return

    // Token: cookie httpOnly o header Authorization: Bearer xxx
    const cookieToken = getCookie(event, 'token')
    const authHeader  = getRequestHeader(event, 'authorization') // h3 helper
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    const token = cookieToken || headerToken

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    }

    // 1) Verificar token
    let payload: any
    try {
        payload = await verifyToken(token)
    } catch (e) {
        throw createError({ statusCode: 401, statusMessage: 'Token inválido o expirado' })
    }

    // 2) Extraer userId del payload (id o sub) y validar que sea numérico
    const rawId = payload?.id ?? payload?.sub
    const userId = Number.isFinite(Number(rawId)) ? Number(rawId) : null
    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Token inválido (sin id numérico)' })
    }

    // 3) Cargar usuario + office_id vía relación employee
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            is_admin: true,
            is_active: true,
            employee_id: true,
            cashier:{
              select:{
                  id: true
              }
            },
            employee: {
                select: {
                    office_id: true,
                    // si quieres también el nombre de la oficina, descomenta:
                    // office: { select: { id: true, name: true } }
                }
            },

        }
    })

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado' })
    }
    if (!user.is_active) {
        throw createError({ statusCode: 401, statusMessage: 'Usuario inactivo' })
    }

    // 4) Dejar auth en el contexto para los endpoints
    ;(event.context as any).auth = {
        token,
        payload,
        user: {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin,
            employee_id: user.employee_id,
            office_id: user.employee?.office_id ?? null,
            cashier_id: user.cashier.id
            // office: user.employee?.office ?? null, // si activaste el select de office arriba
        }
    }
})
