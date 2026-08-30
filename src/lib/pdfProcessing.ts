import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function mergePdfs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        for (const page of pages) mergedPdf.addPage(page)
    }

    const mergedBytes = await mergedPdf.save()
    return new Blob([mergedBytes as BlobPart], { type: 'application/pdf' })
}

export async function getPdfPageCount(file: File): Promise<number> {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    return pdf.getPageCount()
}

export interface PdfPageImage {
    pageNumber: number
    blob: Blob
    url: string
}

export async function pdfPagesToImages(
    file: File,
    format: 'png' | 'jpeg',
    quality: number,
    pageNumbers?: number[],
): Promise<PdfPageImage[]> {
    const bytes = await file.arrayBuffer()
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise
    const totalPages = doc.numPages
    const pages = pageNumbers ?? Array.from({ length: totalPages }, (_, i) => i + 1)

    const results: PdfPageImage[] = []
    for (const pageNumber of pages) {
        const page = await doc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas is not supported in this browser.')

        await page.render({ canvas, canvasContext: ctx, viewport }).promise

        const mime = format === 'png' ? 'image/png' : 'image/jpeg'
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (result) => (result ? resolve(result) : reject(new Error('Failed to render page.'))),
                mime,
                format === 'jpeg' ? quality : undefined,
            )
        })

        results.push({ pageNumber, blob, url: URL.createObjectURL(blob) })
    }

    return results
}
