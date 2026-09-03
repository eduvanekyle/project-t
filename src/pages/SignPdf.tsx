import { useEffect, useMemo, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { FileDropzone } from '../components/FileDropzone'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { getPdfErrorMessage, getPdfPageCount, signPdf } from '../lib/pdfProcessing'

interface Result {
    blob: Blob
    url: string
}

interface PageRenderInfo {
    width: number
    height: number
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function SignPdf() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [pageCount, setPageCount] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
    const [pageSize, setPageSize] = useState<PageRenderInfo>({ width: 0, height: 0 })
    const [x, setX] = useState(60)
    const [y, setY] = useState(60)
    const [width, setWidth] = useState(140)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [isDragging, setDragging] = useState(false)
    const [result, setResult] = useState<Result | null>(null)

    useEffect(() => {
        if (!signatureFile) {
            setSignaturePreview(null)
            return
        }
        const previewUrl = URL.createObjectURL(signatureFile)
        setSignaturePreview(previewUrl)
        return () => URL.revokeObjectURL(previewUrl)
    }, [signatureFile])

    useEffect(() => {
        if (!file) {
            return
        }

        let isCancelled = false

        async function renderPage() {
            try {
                const currentFile = file
                if (!currentFile) return

                const bytes = await currentFile.arrayBuffer()
                const doc = await pdfjsLib.getDocument({ data: bytes }).promise
                const page = await doc.getPage(pageNumber)
                const viewport = page.getViewport({ scale: 1.4 })
                const canvas = canvasRef.current
                if (!canvas || isCancelled) return

                canvas.width = viewport.width
                canvas.height = viewport.height
                const context = canvas.getContext('2d')
                if (!context) throw new Error('Canvas is not supported in this browser.')

                await page.render({ canvas, canvasContext: context, viewport }).promise
                setPageSize({ width: viewport.width, height: viewport.height })
            } catch (err) {
                if (!isCancelled) setError(getPdfErrorMessage(err))
            }
        }

        void renderPage()

        return () => {
            isCancelled = true
        }
    }, [file, pageNumber])

    const pageOptions = useMemo(
        () => Array.from({ length: pageCount ?? 0 }, (_, index) => index + 1),
        [pageCount],
    )

    const handlePdfFiles = async (files: File[]) => {
        const selected = files[0]
        if (selected.type !== 'application/pdf') {
            setError('This file format is not supported. Please upload a PDF file.')
            return
        }
        setError(null)
        setResult(null)
        setFile(selected)
        setSignatureFile(null)
        setSignaturePreview(null)
        try {
            const count = await getPdfPageCount(selected)
            setPageCount(count)
            setPageNumber(1)
            setX(60)
            setY(60)
            setWidth(140)
        } catch (err) {
            setError(getPdfErrorMessage(err))
        }
    }

    const handleSignatureUpload = (files: File[]) => {
        const selected = files[0]
        if (!selected) return
        if (!selected.type.startsWith('image/')) {
            setError('Please upload a PNG or JPG signature image.')
            return
        }
        setError(null)
        setSignatureFile(selected)
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setPageCount(null)
        setPageNumber(1)
        setSignatureFile(null)
        setSignaturePreview(null)
        setPageSize({ width: 0, height: 0 })
        setX(60)
        setY(60)
        setWidth(140)
        setResult(null)
        setError(null)
        setDragging(false)
    }

    const clampPosition = (nextX: number, nextY: number) => {
        if (pageSize.width === 0 || pageSize.height === 0) return
        const maxX = Math.max(0, pageSize.width - width)
        const maxY = Math.max(0, pageSize.height - width * 0.5)
        setX(clamp(nextX, 0, maxX))
        setY(clamp(nextY, 0, maxY))
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        const relativeX = clamp(event.clientX - rect.left, 0, rect.width)
        const relativeY = clamp(event.clientY - rect.top, 0, rect.height)
        const nextX = (relativeX / rect.width) * pageSize.width
        const nextY = (relativeY / rect.height) * pageSize.height
        clampPosition(nextX, nextY)
    }

    const handleSign = async () => {
        if (!file || !signatureFile) {
            setError('Please upload both a PDF and a signature image.')
            return
        }

        setProcessing(true)
        setError(null)

        try {
            const blob = await signPdf(file, signatureFile, {
                pageNumber,
                x,
                y,
                width,
            })
            setResult({ blob, url: URL.createObjectURL(blob) })
        } catch (err) {
            setError(getPdfErrorMessage(err))
        } finally {
            setProcessing(false)
        }
    }

    const signatureDisplayStyle = {
        left: pageSize.width > 0 ? `${(x / pageSize.width) * 100}%` : '10%',
        top: pageSize.height > 0 ? `${(y / pageSize.height) * 100}%` : '10%',
        width: pageSize.width > 0 ? `${(width / pageSize.width) * 100}%` : '30%',
        height: pageSize.height > 0 ? `${(Math.min(width * 0.6, pageSize.height) / pageSize.height) * 100}%` : '14%',
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/pdf-tools"
                backLabel="Back to tools"
                title="Sign PDF"
                description="Upload a PDF, place your signature by dragging it, and download the signed file."
            />

            {!file && (
                <FileDropzone
                    accept="application/pdf"
                    formatsLabel="PDF • Max size: 50 MB"
                    onFiles={handlePdfFiles}
                    error={error}
                />
            )}

            {file && !result && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {formatBytes(file.size)}
                                {pageCount !== null ? ` • ${pageCount} page${pageCount === 1 ? '' : 's'}` : ''}
                            </p>
                        </div>
                        <SecondaryButton onClick={reset}>Remove</SecondaryButton>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                    PDF preview
                                </p>
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <span>Page</span>
                                    <select
                                        value={pageNumber}
                                        onChange={(event) => setPageNumber(Number(event.target.value))}
                                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                                    >
                                        {pageOptions.map((page) => (
                                            <option key={page} value={page}>
                                                {page}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div
                                className="relative overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]"
                                onPointerMove={handlePointerMove}
                                onPointerUp={() => setDragging(false)}
                                onPointerLeave={() => setDragging(false)}
                            >
                                <canvas ref={canvasRef} className="block max-h-[72vh] w-full object-contain" />
                                {signaturePreview && (
                                    <div
                                        role="presentation"
                                        className="absolute cursor-grab active:cursor-grabbing select-none rounded-md border border-accent/50 bg-white/10 backdrop-blur-[1px]"
                                        style={signatureDisplayStyle}
                                        onPointerDown={(event) => {
                                            event.preventDefault()
                                            setDragging(true)
                                        }}
                                    >
                                        <img
                                            src={signaturePreview}
                                            alt="Signature placement"
                                            className="h-full w-full rounded-md object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                    Signature image
                                </p>
                                <div className="mt-3 flex flex-col gap-3">
                                    <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-4 text-sm text-[var(--color-text-muted)] transition-colors hover:border-accent hover:text-accent">
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg"
                                            className="hidden"
                                            onChange={(event) => {
                                                if (event.target.files) handleSignatureUpload(Array.from(event.target.files))
                                                event.target.value = ''
                                            }}
                                        />
                                        {signatureFile ? 'Replace signature image' : 'Upload signature image'}
                                    </label>

                                    {signaturePreview && (
                                        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                                            <img src={signaturePreview} alt="Signature preview" className="max-h-24 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                    Position & size
                                </p>
                                <div className="mt-3 grid gap-3">
                                    <label className="flex flex-col gap-1 text-sm text-[var(--color-text)]">
                                        Width (pts)
                                        <input
                                            type="number"
                                            min={20}
                                            value={width}
                                            onChange={(event) => setWidth(Math.max(20, Number(event.target.value) || 20))}
                                            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm text-[var(--color-text)]">
                                        X position (pts)
                                        <input
                                            type="number"
                                            min={0}
                                            value={x}
                                            onChange={(event) => setX(Math.max(0, Number(event.target.value) || 0))}
                                            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2"
                                        />
                                    </label>

                                    <label className="flex flex-col gap-1 text-sm text-[var(--color-text)]">
                                        Y position (pts)
                                        <input
                                            type="number"
                                            min={0}
                                            value={y}
                                            onChange={(event) => setY(Math.max(0, Number(event.target.value) || 0))}
                                            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2"
                                        />
                                    </label>
                                </div>
                            </div>

                            {error && <p className="text-sm text-danger">{error}</p>}
                            {isProcessing && <ProcessingState label="Signing your PDF…" />}

                            <PrimaryButton onClick={handleSign} disabled={!signatureFile || isProcessing}>
                                Sign PDF
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <SuccessState title="Signature added">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        signed-{file?.name ?? 'document.pdf'} • {formatBytes(result.blob.size)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href={result.url} download={file ? `signed-${file.name}` : 'signed-document.pdf'}>
                            <PrimaryButton>Download</PrimaryButton>
                        </a>
                        <SecondaryButton onClick={reset}>Sign Another PDF</SecondaryButton>
                    </div>
                </SuccessState>
            )}
        </div>
    )
}
