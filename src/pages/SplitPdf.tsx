import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { getPdfErrorMessage, getPdfPageCount, type PdfSplitResult, splitPdf } from '../lib/pdfProcessing'

type SplitMode = 'ranges' | 'every-page'

export function SplitPdf() {
    const [file, setFile] = useState<File | null>(null)
    const [pageCount, setPageCount] = useState<number | null>(null)
    const [mode, setMode] = useState<SplitMode>('ranges')
    const [rangesInput, setRangesInput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [results, setResults] = useState<PdfSplitResult[] | null>(null)

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
        } catch (err) {
            setError(getPdfErrorMessage(err))
        }
    }

    const reset = () => {
        setFile(null)
        setPageCount(null)
        setResults(null)
        setError(null)
        setMode('ranges')
        setRangesInput('')
    }

    const parseRanges = (): { start: number; end: number }[] | null => {
        const parts = rangesInput
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
        if (parts.length === 0) return null

        const ranges: { start: number; end: number }[] = []
        for (const part of parts) {
            const match = /^(\d+)(?:-(\d+))?$/.exec(part)
            if (!match) return null
            const start = Number(match[1])
            const end = match[2] ? Number(match[2]) : start
            if (start < 1 || end < start) return null
            ranges.push({ start, end })
        }
        return ranges
    }

    const handleSplit = async () => {
        if (!file || !pageCount) return

        let ranges: { start: number; end: number }[] | null
        if (mode === 'every-page') {
            ranges = Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }))
        } else {
            ranges = parseRanges()
            if (!ranges) {
                setError('Enter page ranges like "1-3, 5, 7-9".')
                return
            }
        }

        setProcessing(true)
        setError(null)
        try {
            const split = await splitPdf(file, ranges)
            setResults(split)
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
        const base = file.name.replace(/\.pdf$/i, '')
        for (const result of results) {
            zip.file(`${base}-${result.label}.pdf`, result.blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${base}-split.zip`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/pdf-tools"
                backLabel="Back to tools"
                title="Split PDF"
                description="Extract page ranges or split every page into its own PDF file."
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
                                Split mode
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input type="radio" name="mode" checked={mode === 'ranges'} onChange={() => setMode('ranges')} />
                                    Custom page ranges
                                </label>
                                <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input
                                        type="radio"
                                        name="mode"
                                        checked={mode === 'every-page'}
                                        onChange={() => setMode('every-page')}
                                    />
                                    Split every page into its own file
                                </label>
                            </div>

                            {mode === 'ranges' && (
                                <div className="mt-4">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                        Page ranges
                                    </label>
                                    <input
                                        type="text"
                                        value={rangesInput}
                                        onChange={(event) => setRangesInput(event.target.value)}
                                        placeholder={`e.g. 1-3, 5, 7-${pageCount}`}
                                        className="mt-2 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                        Each range or page produces a separate PDF file.
                                    </p>
                                </div>
                            )}

                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleSplit} disabled={isProcessing}>
                                Split PDF
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Splitting your PDF…" />}
                    {error && <p className="text-sm text-danger">{error}</p>}

                    {results && (
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-[var(--color-text)]">
                                    {results.length} file{results.length === 1 ? '' : 's'} ready
                                </p>
                                <div className="flex gap-2">
                                    <SecondaryButton onClick={handleDownloadAll}>Download All</SecondaryButton>
                                    <SecondaryButton onClick={reset}>Split Another</SecondaryButton>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                {results.map((result) => {
                                    const url = URL.createObjectURL(result.blob)
                                    const base = file.name.replace(/\.pdf$/i, '')
                                    return (
                                        <div
                                            key={result.label}
                                            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                                    {base}-{result.label}.pdf
                                                </p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{formatBytes(result.blob.size)}</p>
                                            </div>
                                            <a href={url} download={`${base}-${result.label}.pdf`} className="text-xs font-medium text-accent hover:underline">
                                                Download
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
