import { prisma } from '@/server/utils/prisma'
import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'
import crypto from 'node:crypto'
import {logArticleHistory} from "@/server/services/articleHistory";
export default defineEventHandler(async (event:any) => {
    try{
        const form = await readMultipartFormData(event)
        if (!form || !form.length) {
            throw createError({ statusCode: 400, statusMessage: 'Formulario vacío' })
        }
        const idField = form.find((f:any) => f.name === 'id' && f.type !== 'file')
        const file = form.find((f:any) => f.name === 'photo' && f.filename)
        if (!idField) {
            throw createError({ statusCode: 400, statusMessage: 'Falta el campo id' })
        }
        if (!file?.data?.length) {
            throw createError({ statusCode: 400, statusMessage: 'Campo "photo" faltante o inválido' })
        }
        const articleId = Number(Buffer.from(idField.data).toString('utf8'))
        if (!Number.isFinite(articleId) || articleId <= 0) {
            throw createError({ statusCode: 400, statusMessage: 'id inválido' })
        }
        const existing = await prisma.articles.findUnique({where: { id: articleId }})
        if (!existing) {
            throw createError({ statusCode: 404, statusMessage: 'Artículo no encontrado' })
        }
        const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
        const MAX_BYTES = 5 * 1024 * 1024
        if (!ALLOWED.has(file.type || '')) {
            throw createError({ statusCode: 415, statusMessage: 'Tipo de archivo no permitido' })
        }
        if (file.data.byteLength > MAX_BYTES) {
            throw createError({ statusCode: 413, statusMessage: 'Archivo demasiado grande (máx. 5MB)' })
        }
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'articles')
        await fs.mkdir(uploadDir, { recursive: true })

        const ext = (extname(file.filename || '').toLowerCase() || '.jpg')
        const safeName = crypto.randomBytes(16).toString('hex') + ext
        const diskPath = join(uploadDir, safeName)

        await fs.writeFile(diskPath, file.data)
        const publicUrl = `/uploads/articles/${safeName}`

        if (existing.photo && existing.photo.startsWith('/uploads/articles/')) {
            const oldPath = join(process.cwd(), 'public', existing.photo)
            // Intento de borrado "best-effort" (no rompe si falla)
            fs.unlink(oldPath).catch(() => {})
        }
        await prisma.articles.update({
            where: { id: articleId },
            data: { photo: publicUrl }
        })
        await logArticleHistory(articleId,'Se actualizó la foto del articulo')

        return { ok: true,  url: publicUrl}
    }catch (err:any){
        throw createError({
            statusCode: err?.statusCode ?? 500,
            statusMessage: err?.statusMessage ?? 'Error al subir la foto'
        })
  }
})
