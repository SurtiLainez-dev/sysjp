import PDFDocument from "pdfkit"
import { prisma } from "../../../utils/prisma"
import { defineEventHandler, createError, sendStream, setHeader } from "h3"
import { PassThrough } from "node:stream"
import fs from "node:fs"
import path from "node:path"

export default defineEventHandler(async (event) => {
    try {
        const id = Number(event.context.params?.id)

        if (!id || Number.isNaN(id)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid id",
            })
        }

        const factura = await prisma.facGenerica.findUnique({
            where: { id },
            include: {
                cuerpo: {
                    orderBy: { orden: "asc" },
                },
            },
        })

        if (!factura) {
            throw createError({
                statusCode: 404,
                statusMessage: "Invoice not found",
            })
        }

        const toNumber = (value: unknown): number => {
            const n = Number(value)
            return Number.isFinite(n) ? n : 0
        }

        const round2 = (value: number): number =>
            Math.round((value + Number.EPSILON) * 100) / 100

        const money = (value: unknown): string =>
            new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(toNumber(value))

        const formatDateDisplay = (value: unknown): string => {
            if (!value) return "-"
            const d = new Date(String(value))
            return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${d.getFullYear()}`
        }

        const formatInvoiceNumber = (value: unknown, invoiceId: number): string => {
            if (!value) return `00000000-${invoiceId}`
            const d = new Date(String(value))
            return `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${d.getFullYear()}-${invoiceId}`
        }

        const totalDiscount = round2(toNumber(factura.total_descuento))
        const subTotal = round2(toNumber(factura.sub_total))
        const taxes = round2(toNumber(factura.taxes))
        const invoiceTotal = round2(toNumber(factura.total))

        const squareRate = round2(toNumber(factura.tasa_square) || 0.035)
        const squareFixed = round2(toNumber(factura.fee_square_fijo) || 0.15)

        // 🔥 CORRECCIÓN CLAVE AQUÍ
        let cardProcessingFee = 0
        let totalDue = invoiceTotal

        if (factura.paga_con_tarjeta) {
            totalDue = round2((subTotal + squareFixed) / (1 - squareRate))
            cardProcessingFee = round2(totalDue - subTotal)
        }

        const invoiceNumberText = formatInvoiceNumber(factura.fecha, factura.id)
        const dateText = formatDateDisplay(factura.fecha)
        const latestShipDate = formatDateDisplay((factura as any).fecha_maximo_envio)
        const cliente = (factura as any).cliente?.trim() || "-"
        const shipTo = (factura as any).direccion_envio?.trim() || "-"
        const rawNotes = (factura as any).observacion?.trim() || ""
        const hasNotes = rawNotes.length > 0
        const paymentMethod = factura.paga_con_tarjeta ? "CARD" : "CASH"

        const items = factura.cuerpo || []

        const stream = new PassThrough()
        const doc = new PDFDocument({
            size: "LETTER",
            margin: 28,
            bufferPages: true,
        })

        setHeader(event, "Content-Type", "application/pdf")
        setHeader(event, "Content-Disposition", `inline; filename="invoice_${id}.pdf"`)

        doc.pipe(stream)

        const pageWidth = doc.page.width
        const pageHeight = doc.page.height
        const left = 28
        const right = pageWidth - 28
        const contentWidth = right - left

        let cursorY = 22

        const drawLine = (y: number) => {
            doc.moveTo(left, y).lineTo(right, y).strokeColor("#cfcfcf").lineWidth(1).stroke()
        }

        const drawText = (
            text: string,
            x: number,
            y: number,
            width: number,
            align: "left" | "right" | "center" = "left",
            bold = false,
            size = 9,
            color = "#111111"
        ) => {
            doc.font(bold ? "Helvetica-Bold" : "Helvetica")
                .fontSize(size)
                .fillColor(color)
                .text(text || "-", x, y, { width, align, ellipsis: true })
        }

        // HEADER
        const logoPath = path.join(process.cwd(), "public", "logo3.jpeg")
        if (fs.existsSync(logoPath)) {
            const logoWidth = 250
            const logoX = ((pageWidth - logoWidth) / 2) + 60
            doc.image(logoPath, logoX, cursorY, { fit: [logoWidth, 95] })
        }

        drawText("INVOICE", right - 210, cursorY + 2, 210, "right", true, 22)
        drawText(`Invoice #: ${factura.numero}`, right - 210, cursorY + 28, 210, "right")
        drawText(`Date: ${dateText}`, right - 210, cursorY + 48, 210, "right")

        drawText("1706 LOUDON AVE NW ROANOKE VA 24017", left, cursorY + 103, contentWidth, "center", false, 10, "#666666")

        cursorY += 128
        drawLine(cursorY)
        cursorY += 12

        // FOOTER (TOTALES)
        const footerY = pageHeight - 92

        drawText("Discount:", left, footerY, 80)
        drawText(money(totalDiscount), left + 60, footerY, 80)

        drawText("Sub Total:", left + 140, footerY, 80)
        drawText(money(subTotal), left + 210, footerY, 80)

        drawText("Taxes:", left + 290, footerY, 80)
        drawText(money(taxes), left + 340, footerY, 80)

        drawText("Fees:", left + 400, footerY, 80)
        drawText(money(cardProcessingFee), left + 440, footerY, 80)

        drawText("Total:", left + 500, footerY, 60, "left", true, 11)
        drawText(money(totalDue), left + 540, footerY, 80, "left", true, 11)

        doc.end()
        return sendStream(event, stream)

    } catch (error: any) {
        console.error("PDF ERROR:", error)
        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage: error?.statusMessage || error?.message || "Error generating PDF",
        })
    }
})
