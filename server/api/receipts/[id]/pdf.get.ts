// server/api/receipts/[id]/pdf.get.ts
import { prisma } from '@/server/utils/prisma'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import { getRouterParam, sendStream } from 'h3'

const num = (v: any) => Number.parseFloat(String(v || 0))

// 👉 formats receipt id with leading zeros to length 10
function formatReceiptNumber(id: number): string {
    return id.toString().padStart(10, '0')
}

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid receipt ID' })
    }

    // 1) Fetch receipt + cashier + office
    const receipt = await prisma.receipts.findUnique({
        where: { id },
        include: {
            customer: true,
            payment_method: true,
            items: true,
            taxes: { include: { tax: true } },
            cashier: {
                include: {
                    office: true, // <<-- to get office name
                },
            },
        },
    })

    if (!receipt) {
        throw createError({ statusCode: 404, statusMessage: 'Receipt not found' })
    }

    const paddedNumber = formatReceiptNumber(receipt.id)
    const officeName = receipt.cashier?.office?.name ?? 'Main Office'

    // 2) 80mm ticket size
    const RECEIPT_WIDTH = 226.77 // ~80mm
    const BASE_HEIGHT = 260
    const EXTRA_PER_ITEM = 18
    const height =
        BASE_HEIGHT +
        receipt.items.length * EXTRA_PER_ITEM +
        (receipt.taxes.length ? 40 : 0)

    const doc = new PDFDocument({
        size: [RECEIPT_WIDTH, height],
        margin: 10,
    })

    const stream = new PassThrough()
    doc.pipe(stream)

    // Use monospace font for alignment
    doc.font('Courier')

    // ---------- HEADER ----------
    doc
        .fontSize(10)
        .text('SALON', { align: 'center' })
        .text(officeName, { align: 'center' })
    doc.moveDown(0.3)

    doc
        .fontSize(9)
        .text(`Receipt No: ${paddedNumber}`, { align: 'center' })
        .text(
            `Date: ${new Date(receipt.created_at).toLocaleString()}`,
            { align: 'center' }
        )

    if (receipt.payment_method) {
        doc.text(`Payment Method: ${receipt.payment_method.name}`, {
            align: 'center',
        })
    }

    if (receipt.customer) {
        doc.moveDown(0.3)
        doc.text(`Customer: ${receipt.customer.name}`, {
            align: 'center',
            width: RECEIPT_WIDTH - 20,
        })
    }

    doc.moveDown(0.5)
    doc
        .fontSize(8)
        .text('--------------------------------', { align: 'center' })

    // ---------- ITEMS HEADER ----------
    doc.moveDown(0.2)
    doc.fontSize(8)

    // QTY  DESCRIPTION           AMOUNT
    const headerLine = 'Qty   Description          Amount'
    doc.text(headerLine)
    doc.text('--------------------------------')

    // ---------- ITEMS ----------
    receipt.items.forEach((it) => {
        const qty = num(it.qty || 0)
        const unit = num(it.unit_price || 0)
        const lineTotal = qty * unit

        const qtyStr = qty.toString().padEnd(4, ' ')
        // article name stays as it comes from DB (Spanish o inglés)
        const name = (it.name || '').substring(0, 18).padEnd(18, ' ')
        const totalStr = lineTotal.toFixed(2).padStart(8, ' ')

        const line = `${qtyStr} ${name} ${totalStr}`

        doc.text(line)
    })

    doc.text('--------------------------------')

    // ---------- TAXES ----------
    const subtotal = num(receipt.subtotal)
    const taxTotal = num(receipt.tax_total)
    const total = num(receipt.total)

    if (receipt.taxes.length) {
        doc.text('Taxes:', { continued: false })
        receipt.taxes.forEach((t) => {
            const name = (t.tax.name || '').substring(0, 22).padEnd(22, ' ')
            const amt = num(t.amount || 0).toFixed(2).padStart(8, ' ')
            doc.text(`${name}${amt}`)
        })
        doc.text('--------------------------------')
    }

    // ---------- TOTALS ----------
    const labelWidth = 14

    const lineSub =
        `Subtotal:`.padEnd(labelWidth, ' ') +
        subtotal.toFixed(2).padStart(10, ' ')
    const lineTax =
        `Tax:`.padEnd(labelWidth, ' ') +
        taxTotal.toFixed(2).padStart(10, ' ')
    const lineTot =
        `TOTAL:`.padEnd(labelWidth, ' ') +
        total.toFixed(2).padStart(10, ' ')

    doc.text(lineSub)
    doc.text(lineTax)
    doc.text(lineTot)

    doc.text('--------------------------------')

    doc.moveDown(0.5)
    doc
        .fontSize(8)
        .text('Thank you for your purchase!', { align: 'center' })
        .text('¡Gracias por su compra!', { align: 'center' })

    doc.end()

    // 3) headers + stream
    event.node.res.setHeader('Content-Type', 'application/pdf')
    event.node.res.setHeader(
        'Content-Disposition',
        `inline; filename=receipt-${paddedNumber}.pdf`
    )

    return sendStream(event, stream)
})
