import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export function getPdfErrorMessage(error: unknown): string {
    if (error instanceof Error && error.name === 'PasswordException') {
        return 'This PDF is password-protected. Remove the password and try again.'
    }
    if (error instanceof pdfjsLib.InvalidPDFException) {
        return 'This file could not be read as a PDF. It may be corrupted.'
    }
    console.error('PDF processing error:', error)
    return 'Something went wrong while processing your PDF. Please try again.'
}

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

export type PdfCompressionLevel = 'low' | 'medium' | 'high'

interface PdfCompressionProfile {
    scale: number
    quality: number
}

const PDF_COMPRESSION_PROFILES: Record<PdfCompressionLevel, PdfCompressionProfile> = {
    low: { scale: 1.5, quality: 0.85 },
    medium: { scale: 1.2, quality: 0.65 },
    high: { scale: 0.9, quality: 0.45 },
}

async function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<ArrayBuffer> {
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error('Failed to compress PDF page.'))),
            'image/jpeg',
            quality,
        )
    })
    return blob.arrayBuffer()
}

export async function compressPdf(file: File, level: PdfCompressionLevel = 'medium'): Promise<Blob> {
    const bytes = await file.arrayBuffer()
    if (level === 'low') {
        const pdf = await PDFDocument.load(bytes)
        const compressedBytes = await pdf.save({ useObjectStreams: true })
        const output = compressedBytes.byteLength < bytes.byteLength ? compressedBytes : bytes
        return new Blob([output as BlobPart], { type: 'application/pdf' })
    }

    // pdf.js may transfer and detach the ArrayBuffer given to its worker.
    const originalBytes = new Uint8Array(bytes.slice(0))
    const source = await pdfjsLib.getDocument({ data: bytes }).promise
    const profile = PDF_COMPRESSION_PROFILES[level]
    const compressedPdf = await PDFDocument.create()

    try {
        for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
            const sourcePage = await source.getPage(pageNumber)
            const pageViewport = sourcePage.getViewport({ scale: 1 })
            const renderViewport = sourcePage.getViewport({ scale: profile.scale })
            const canvas = document.createElement('canvas')
            canvas.width = Math.ceil(renderViewport.width)
            canvas.height = Math.ceil(renderViewport.height)
            const context = canvas.getContext('2d')
            if (!context) throw new Error('Canvas is not supported in this browser.')

            await sourcePage.render({ canvas, canvasContext: context, viewport: renderViewport }).promise
            const imageBytes = await canvasToJpegBytes(canvas, profile.quality)
            const image = await compressedPdf.embedJpg(imageBytes)
            const page = compressedPdf.addPage([pageViewport.width, pageViewport.height])
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: pageViewport.width,
                height: pageViewport.height,
            })
        }
    } finally {
        await source.destroy()
    }

    const compressedBytes = await compressedPdf.save({ useObjectStreams: true })
    const output = compressedBytes.byteLength < originalBytes.byteLength ? compressedBytes : originalBytes
    return new Blob([output as BlobPart], { type: 'application/pdf' })
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

export interface SignPdfOptions {
    pageNumber: number
    x: number
    y: number
    width: number
}

export async function signPdf(file: File, signatureFile: File, options: SignPdfOptions): Promise<Blob> {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)

    const imageBytes = await signatureFile.arrayBuffer()
    const signatureImage = signatureFile.type === 'image/png' ? await pdf.embedPng(imageBytes) : await pdf.embedJpg(imageBytes)

    const page = pdf.getPage(options.pageNumber - 1)
    const pageSize = page.getSize()
    const targetWidth = Math.min(options.width, pageSize.width - options.x)
    const scale = targetWidth / signatureImage.width
    const targetHeight = signatureImage.height * scale

    page.drawImage(signatureImage, {
        x: options.x,
        y: Math.max(0, pageSize.height - options.y - targetHeight),
        width: targetWidth,
        height: targetHeight,
    })

    const out = await pdf.save()
    return new Blob([out as BlobPart], { type: 'application/pdf' })
}
