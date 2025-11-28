// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
    g.prisma ??
    new PrismaClient({
        log: ['error', 'warn'], // agrega 'query' si quieres ver las consultas
    })

if (process.env.NODE_ENV !== 'production') g.prisma = prisma
