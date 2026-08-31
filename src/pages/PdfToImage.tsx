import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { QualitySlider } from '../components/QualitySlider'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { getPdfErrorMessage, getPdfPageCount, type PdfPageImage, pdfPagesToImages } from '../lib/pdfProcessing'

type OutputFormat = 'png' | 'jpeg'
type PageSelection = 'all' | 'custom'

export function PdfToImage() {
    const [file, setFile] = useState<File | null>(null)
    const [pageCount, setPageCount] = useState<number | null>(null)
    const [format, setFormat] = useState<OutputFormat>('png')
    const [quality, setQuality] = useState(85)
    const [selectionMode, setSelectionMode] = useState<PageSelection>('all')
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [results, setResults] = useState<PdfPageImage[] | null>(null)

    const handleFiles = async (files: File[]) => {
        const selected = files[0]
        if (selected.type !== 'application/pdf') {
            setError('This file format is not supported. Please upload a PDF file.')
            return
        }
        setError(null)
        setFile(selected)
        setResults(null)
        try {
            const count = await getPdfPageCount(selected)
            setPageCount(count)
            setSelectedPages(new Set([1]))
        } catch (err) {
            setError(getPdfErrorMessage(err))
        }
    }

    const reset = () => {
        results?.forEach((page) => URL.revokeObjectURL(page.url))
        setFile(null)
        setPageCount(null)
        setResults(null)
        setError(null)
        setSelectionMode('all')
    }

    const togglePage = (page: number) => {
        setSelectedPages((current) => {
            const next = new Set(current)
            if (next.has(page)) next.delete(page)
            else next.add(page)
            return next
        })
    }

    const handleConvert = async () => {
        if (!file) return
        const pageNumbers = selectionMode === 'custom' ? Array.from(selectedPages).sort((a, b) => a - b) : undefined
        if (selectionMode === 'custom' && (!pageNumbers || pageNumbers.length === 0)) {
            setError('Select at least one page to convert.')
            return
        }
        setProcessing(true)
        setError(null)
        try {
            const pages = await pdfPagesToImages(file, format, quality / 100, pageNumbers)
            setResults(pages)
        } catch (err) {
            setError(getPdfErrorMessage(err))
        } finally {
            setProcessing(false)
        }
    }

    const handleDownloadAll = async () => {
        if (!results || !file) return
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        const ext = format === 'jpeg' ? 'jpg' : 'png'
        for (const page of results) {
            zip.file(`page-${page.pageNumber}.${ext}`, page.blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${file.name.replace(/\.pdf$/i, '')}-pages.zip`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/pdf-tools"
                backLabel="Back to tools"
                title="PDF to Image"
                description="Convert PDF pages into JPG or PNG images."
            />

            {!file && (
                <FileDropzone
                    accept="application/pdf"
                    formatsLabel="PDF • Max size: 50 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && (
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

                    {!results && pageCount !== null && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                Output format
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input type="radio" name="format" checked={format === 'png'} onChange={() => setFormat('png')} />
                                    PNG
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input type="radio" name="format" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} />
                                    JPG
                                </label>
                            </div>

                            {format === 'jpeg' && (
                                <div className="mt-4">
                                    <QualitySlider value={quality} onChange={setQuality} label="Image quality" />
                                </div>
                            )}

                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                Pages
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input
                                        type="radio"
                                        name="selection"
                                        checked={selectionMode === 'all'}
                                        onChange={() => setSelectionMode('all')}
                                    />
                                    Convert all pages
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input
                                        type="radio"
                                        name="selection"
                                        checked={selectionMode === 'custom'}
                                        onChange={() => setSelectionMode('custom')}
                                    />
                                    Convert selected pages
                                </label>
                            </div>

                            {selectionMode === 'custom' && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => togglePage(page)}
                                            className={
                                                selectedPages.has(page)
                                                    ? 'h-9 w-9 rounded-md bg-accent text-sm font-medium text-white'
                                                    : 'h-9 w-9 rounded-md border border-[var(--color-border-strong)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                                            }
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleConvert} disabled={isProcessing}>
                                Convert PDF
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Converting your PDF…" />}
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    {results && (
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-[var(--color-text)]">
                                    {results.length} image{results.length === 1 ? '' : 's'} ready
                                </p>
                                <div className="flex gap-2">
                                    <SecondaryButton onClick={handleDownloadAll}>Download All</SecondaryButton>
                                    <SecondaryButton onClick={reset}>Convert Another</SecondaryButton>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {results.map((page) => (
                                    <div
                                        key={page.pageNumber}
                                        className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                                    >
                                        <img
                                            src={page.url}
                                            alt={`Page ${page.pageNumber} preview`}
                                            className="aspect-[3/4] w-full rounded-md border border-[var(--color-border)] object-cover"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[var(--color-text-muted)]">Page {page.pageNumber}</span>
                                            <a
                                                href={page.url}
                                                download={`page-${page.pageNumber}.${format === 'jpeg' ? 'jpg' : 'png'}`}
                                                className="text-xs font-medium text-accent hover:underline"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
