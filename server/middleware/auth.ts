// server/middleware/auth.global.ts
// Corre en TODAS las requests de servidor

import { verifyToken } from '~/server/utils/jwt'
import { prisma } from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)

    // Log de entrada al middleware
    console.log('[auth.middleware] Nueva request:', url.pathname)

    // Solo proteger /api/**
    if (!url.pathname.startsWith('/api')) {
        // console.log('[auth.middleware] Ruta no API, se permite:', url.pathname)
        return
    }

    // Rutas públicas
    const publicPaths = ['/api/auth/login', '/api/auth/logout']
    if (publicPaths.some((p) => url.pathname.startsWith(p))) {
        console.log('[auth.middleware] Ruta pública, se permite acceso:', url.pathname)
        return
    }

    // Token: cookie httpOnly o header Authorization: Bearer xxx
    const cookieToken = getCookie(event, 'token')
    const authHeader = getRequestHeader(event, 'authorization')
    const headerToken =
        authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    const token = cookieToken || headerToken

    if (!token) {
        console.warn('[auth.middleware] Sin token. Ruta:', url.pathname)
        throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
    }

    console.log(
        '[auth.middleware] Token recibido (primeros 20 chars):',
        token.slice(0, 20) + '...'
    )

    // 1) Verificar token
    let payload: any
    try {
        payload = await verifyToken(token)
    } catch (e) {
        console.error('[auth.middleware] Error en verifyToken:', e)
        throw createError({ statusCode: 401, statusMessage: 'Token inválido o expirado' })
    }

    // 2) Extraer userId del payload (id o sub) y validar que sea numérico
    const rawId = payload?.id ?? payload?.sub
    const userId = Number.isFinite(Number(rawId)) ? Number(rawId) : null
    if (!userId) {
        console.warn('[auth.middleware] Token sin id numérico. rawId:', rawId)
        throw createError({ statusCode: 401, statusMessage: 'Token inválido (sin id numérico)' })
    }

    console.log('[auth.middleware] Buscando usuario con id:', userId)

    // 3) Cargar usuario + office_id vía relación employee
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            is_admin: true,
            is_active: true,
            employee_id: true,
            cashier: {
                select: {
                    id: true,
                },
            },
            employee: {
                select: {
                    office_id: true,
                },
            },
        },
    })

    if (!user) {
        console.warn('[auth.middleware] Usuario no encontrado. id:', userId)
        throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado' })
    }
    if (!user.is_active) {
        console.warn('[auth.middleware] Usuario inactivo. id:', userId)
        throw createError({ statusCode: 401, statusMessage: 'Usuario inactivo' })
    }

    const cashierId = user.cashier?.id ?? null

    console.log('[auth.middleware] Usuario OK:', {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        employee_id: user.employee_id,
        office_id: user.employee?.office_id ?? null,
        cashier_id: cashierId,
    })

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
            cashier_id: cashierId,
        },
    }

    console.log('[auth.middleware] auth context seteado. Ruta:', url.pathname)
})
