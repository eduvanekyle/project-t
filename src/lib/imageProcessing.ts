export type ImageFormat = 'png' | 'jpeg' | 'webp'

const MIME_BY_FORMAT: Record<ImageFormat, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
}

const FORMAT_BY_MIME: Record<string, ImageFormat> = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/webp': 'webp',
}

export const ACCEPTED_IMAGE_TYPES = Object.keys(FORMAT_BY_MIME)

export function detectImageFormat(file: File): ImageFormat | null {
    return FORMAT_BY_MIME[file.type] ?? null
}

export function formatLabel(format: ImageFormat): string {
    return format === 'jpeg' ? 'JPG' : format.toUpperCase()
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
    return createImageBitmap(file)
}

function renderToCanvas(bitmap: ImageBitmap, fillWhite: boolean): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not supported in this browser.')
    if (fillWhite) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, 0, 0)
    return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode image.'))),
            mime,
            quality,
        )
    })
}

export async function convertImage(file: File, targetFormat: ImageFormat): Promise<Blob> {
    const bitmap = await loadBitmap(file)
    const canvas = renderToCanvas(bitmap, targetFormat === 'jpeg')
    return canvasToBlob(canvas, MIME_BY_FORMAT[targetFormat], targetFormat === 'png' ? undefined : 0.92)
}

export async function compressImage(file: File, quality: number): Promise<Blob> {
    const bitmap = await loadBitmap(file)
    const sourceFormat = detectImageFormat(file) ?? 'jpeg'
    // PNG has no lossy quality control, so compress it as JPEG to make the slider meaningful.
    const targetFormat: ImageFormat = sourceFormat === 'png' ? 'jpeg' : sourceFormat
    const canvas = renderToCanvas(bitmap, targetFormat === 'jpeg')
    return canvasToBlob(canvas, MIME_BY_FORMAT[targetFormat], quality)
}

export function replaceExtension(filename: string, format: ImageFormat): string {
    const base = filename.replace(/\.[^./]+$/, '')
    const ext = format === 'jpeg' ? 'jpg' : format
    return `${base}.${ext}`
}
