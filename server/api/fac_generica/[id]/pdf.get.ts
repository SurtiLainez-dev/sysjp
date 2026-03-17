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
                    orderBy: {
                        orden: "asc",
                    },
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

        const round2 = (value: number): number => {
            return Math.round((value + Number.EPSILON) * 100) / 100
        }

        const money = (value: unknown): string => {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(toNumber(value))
        }

        const formatDateDisplay = (value: unknown): string => {
            if (!value) return "-"
            const d = new Date(String(value))
            const mm = String(d.getMonth() + 1).padStart(2, "0")
            const dd = String(d.getDate()).padStart(2, "0")
            const yyyy = d.getFullYear()
            return `${mm}-${dd}-${yyyy}`
        }

        const formatInvoiceNumber = (value: unknown, invoiceId: number): string => {
            if (!value) return `00000000-${invoiceId}`
            const d = new Date(String(value))
            const mm = String(d.getMonth() + 1).padStart(2, "0")
            const dd = String(d.getDate()).padStart(2, "0")
            const yyyy = d.getFullYear()
            return `${mm}${dd}${yyyy}-${invoiceId}`
        }

        const totalDiscount = round2(toNumber(factura.total_descuento))
        const subTotal = round2(toNumber(factura.sub_total))
        const taxes = round2(toNumber(factura.taxes))
        const invoiceTotal = round2(toNumber(factura.total))

        const squareRate = round2(toNumber(factura.tasa_square) || 0.035)
        const squareFixed = round2(toNumber(factura.fee_square_fijo) || 0.15)

        let cardProcessingFee = 0
        let totalDue = invoiceTotal

        if (factura.paga_con_tarjeta) {
            totalDue = round2((invoiceTotal + squareFixed) / (1 - squareRate))
            cardProcessingFee = round2(totalDue - invoiceTotal)
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
            doc
                .moveTo(left, y)
                .lineTo(right, y)
                .strokeColor("#cfcfcf")
                .lineWidth(1)
                .stroke()
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
            doc
                .font(bold ? "Helvetica-Bold" : "Helvetica")
                .fontSize(size)
                .fillColor(color)
                .text(text || "-", x, y, {
                    width,
                    align,
                    ellipsis: true,
                })
        }

        // HEADER
        const logoPath = path.join(process.cwd(), "public", "logo3.jpeg")
        if (fs.existsSync(logoPath)) {
            try {
                const logoWidth = 250
                const logoX = ((pageWidth - logoWidth) / 2) + 60
                doc.image(logoPath, logoX, cursorY, {
                    fit: [logoWidth, 95],
                })
            } catch {}
        }

        drawText("INVOICE", right - 210, cursorY + 2, 210, "right", true, 22, "#222222")
        drawText(`Invoice #: ${factura.numero}`, right - 210, cursorY + 28, 210, "right", false, 11, "#333333")
        drawText(`Date: ${dateText}`, right - 210, cursorY + 48, 210, "right", false, 11, "#333333")

        drawText("1706 LOUDON AVE NW ROANOKE VA 24017", left, cursorY + 103, contentWidth, "center", false, 10, "#666666")

        cursorY += 128
        drawLine(cursorY)
        cursorY += 12


        // INFO BLOCKS
        const billX = left
        const billW = 170

        const shipX = left + 200
        const shipW = 150

        const rightInfoW = 150
        const rightInfoX = right - rightInfoW

        drawText("Bill To:", billX, cursorY, billW, "left", true, 10.5, "#333333")
        drawText(cliente, billX, cursorY + 14, billW, "left", false, 9.5, "#111111")

        drawText("Ship To:", shipX, cursorY, shipW, "left", true, 10.5, "#333333")
        drawText(shipTo, shipX, cursorY + 14, shipW, "left", false, 9.5, "#111111")

        drawText("Latest Ship Date:", rightInfoX, cursorY, rightInfoW, "left", true, 10, "#333333")
        drawText(latestShipDate, rightInfoX, cursorY + 12, rightInfoW, "left", false, 9.5, "#111111")

        drawText("Payment Method:", rightInfoX, cursorY + 32, rightInfoW, "left", true, 10, "#333333")
        drawText(paymentMethod, rightInfoX, cursorY + 44, rightInfoW, "left", false, 9.5, "#111111")

        cursorY += 72

        if (hasNotes) {
            drawText("Notes:", left, cursorY, contentWidth, "left", true, 10.5, "#333333")
            drawText(rawNotes, left, cursorY + 14, contentWidth, "left", false, 9.5, "#111111")
        }

        // TABLE
        const tableX = left
        const tableY = cursorY
        const tableWidth = contentWidth

        // más espacio abajo para el mensaje
        const footerTopY = pageHeight - 100
        const tableBottomY = footerTopY - 12
        const tableHeight = tableBottomY - tableY

        const headerHeight = 22
        const rowHeight = 17

        const cols = {
            itemNo: { x: tableX + 5, w: 24 },
            description: { x: tableX + 34, w: 245 },
            qty: { x: tableX + 284, w: 48 },
            unit: { x: tableX + 337, w: 64 },
            discount: { x: tableX + 406, w: 62 },
            total: { x: tableX + 473, w: 62 },
        }

        // outer border stays tall
        doc
            .rect(tableX, tableY, tableWidth, tableHeight)
            .strokeColor("#bdbdbd")
            .lineWidth(1)
            .stroke()

        // header
        doc
            .rect(tableX, tableY, tableWidth, headerHeight)
            .fill("#e9e9e9")

        drawText("#", cols.itemNo.x, tableY + 6, cols.itemNo.w, "left", true, 7.2)
        drawText("Description", cols.description.x, tableY + 6, cols.description.w, "left", true, 7.2)
        drawText("Qty", cols.qty.x, tableY + 6, cols.qty.w, "right", true, 7.2)
        drawText("Unit Price", cols.unit.x, tableY + 6, cols.unit.w, "right", true, 7.2)
        drawText("Discount", cols.discount.x, tableY + 6, cols.discount.w, "right", true, 7.2)
        drawText("Total", cols.total.x, tableY + 6, cols.total.w, "right", true, 7.2)

        doc
            .moveTo(tableX, tableY + headerHeight)
            .lineTo(tableX + tableWidth, tableY + headerHeight)
            .strokeColor("#bdbdbd")
            .lineWidth(1)
            .stroke()

        // inner borders only until last visible record row
        const visibleRows = Math.max(items.length, 1)
        const innerGridBottomY = Math.min(
            tableY + headerHeight + visibleRows * rowHeight,
            tableY + tableHeight
        )

        const verticals = [
            cols.description.x - 5,
            cols.qty.x - 5,
            cols.unit.x - 5,
            cols.discount.x - 5,
            cols.total.x - 5,
        ]

        for (const vx of verticals) {
            doc
                .moveTo(vx, tableY)
                .lineTo(vx, innerGridBottomY)
                .strokeColor("#d2d2d2")
                .lineWidth(1)
                .stroke()
        }

        let rowY = tableY + headerHeight

        for (let i = 0; i < items.length; i++) {
            doc
                .moveTo(tableX, rowY)
                .lineTo(tableX + tableWidth, rowY)
                .strokeColor("#e1e1e1")
                .lineWidth(1)
                .stroke()

            const item = items[i]
            const descripcion = `${item.cod || "-"}  ${item.articulo || "-"}`

            // letra más pequeña pero legible
            drawText(String(i + 1), cols.itemNo.x, rowY + 4.2, cols.itemNo.w, "left", false, 7.0)
            drawText(descripcion, cols.description.x, rowY + 4.2, cols.description.w, "left", false, 7.0)
            drawText(toNumber(item.cantidad).toFixed(2), cols.qty.x, rowY + 4.2, cols.qty.w, "right", false, 7.0)
            drawText(money(item.precio), cols.unit.x, rowY + 4.2, cols.unit.w, "right", false, 7.0)
            drawText(money(item.total_descuento), cols.discount.x, rowY + 4.2, cols.discount.w, "right", false, 7.0)
            drawText(money(item.total_registro), cols.total.x, rowY + 4.2, cols.total.w, "right", false, 7.0)

            rowY += rowHeight
        }

        if (items.length > 0) {
            doc
                .moveTo(tableX, innerGridBottomY)
                .lineTo(tableX + tableWidth, innerGridBottomY)
                .strokeColor("#d2d2d2")
                .lineWidth(1)
                .stroke()
        }

        // FOOTER HORIZONTAL
        const footerY = footerTopY + 8
        const footerFont = 9.1
        const startX = left + 8

        drawText("Discount:", startX, footerY, 52, "left", false, footerFont, "#333333")
        drawText(money(totalDiscount), startX + 52, footerY, 58, "left", false, footerFont, "#111111")

        drawText("Sub Total:", startX + 118, footerY, 58, "left", false, footerFont, "#333333")
        drawText(money(subTotal), startX + 176, footerY, 66, "left", false, footerFont, "#111111")

        drawText("Taxes:", startX + 248, footerY, 42, "left", false, footerFont, "#333333")
        drawText(money(taxes), startX + 290, footerY, 58, "left", false, footerFont, "#111111")

        drawText("Fees:", startX + 352, footerY, 34, "left", false, footerFont, "#333333")
        drawText(money(cardProcessingFee), startX + 386, footerY, 58, "left", false, footerFont, "#111111")

        drawText("Total:", startX + 456, footerY - 1, 36, "left", true, 10.3, "#111111")
        drawText(money(totalDue), startX + 494, footerY - 1, 78, "left", true, 10.3, "#111111")

        // MENSAJE FINAL
        drawText(
            "Thank you for your purchase",
            left,
            footerY + 18,
            contentWidth,
            "center",
            false,
            6.1,
            "#666666"
        )

        const range = doc.bufferedPageRange()
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i)
            doc
                .font("Helvetica")
                .fontSize(8.0)
                .fillColor("#444444")
                .text(`page ${i + 1} / ${range.count}`, left, footerY + 40, {
                    width: contentWidth,
                    align: "center",
                })
        }

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
