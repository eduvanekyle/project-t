import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FilePreview } from '../components/FilePreview'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { compressPdf, getPdfErrorMessage, type PdfCompressionLevel } from '../lib/pdfProcessing'

const COMPRESSION_LEVELS: { value: PdfCompressionLevel; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Best quality, lightest compression' },
    { value: 'medium', label: 'Medium', description: 'Balanced quality and file size' },
    { value: 'high', label: 'High', description: 'Smallest file, lower quality' },
]

interface Result {
    blob: Blob
    url: string
    filename: string
}

export function PdfCompressor() {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)
    const [level, setLevel] = useState<PdfCompressionLevel>('medium')

    const handleFiles = (files: File[]) => {
        const selected = files[0]
        if (!selected || selected.type !== 'application/pdf') {
            setError('This file format is not supported. Please upload a PDF file.')
            return
        }
        setError(null)
        setFile(selected)
        setResult(null)
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setResult(null)
        setError(null)
        setLevel('medium')
    }

    const handleCompress = async () => {
        if (!file) return
        setProcessing(true)
        setError(null)
        try {
            const blob = await compressPdf(file, level)
            const base = file.name.replace(/\.pdf$/i, '')
            setResult({
                blob,
                url: URL.createObjectURL(blob),
                filename: `${base}-compressed.pdf`,
            })
        } catch (err) {
            setError(getPdfErrorMessage(err))
        } finally {
            setProcessing(false)
        }
    }

    const saved = result && file ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100)) : null

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/pdf-tools"
                backLabel="Back to tools"
                title="PDF Compressor"
                description="Reduce PDF file size while keeping your document content intact."
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
                    <FilePreview file={file} formatLabel="PDF" onRemove={reset} />

                    {!result && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Low preserves the original document structure. Medium and High rebuild pages as compressed images, which can remove selectable text, forms, and annotations.
                            </p>
                            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {COMPRESSION_LEVELS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setLevel(option.value)}
                                        className={`rounded-md border p-3 text-left transition-colors ${
                                            level === option.value
                                                ? 'border-accent bg-accent-soft'
                                                : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                                        }`}
                                        aria-pressed={level === option.value}
                                    >
                                        <span className="block text-sm font-medium text-[var(--color-text)]">{option.label}</span>
                                        <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{option.description}</span>
                                    </button>
                                ))}
                            </div>
                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleCompress} disabled={isProcessing}>
                                Compress PDF
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Compressing your PDF…" />}
                    {error && <p className="text-sm text-danger">{error}</p>}

                    {result && saved !== null && (
                        <SuccessState title="Compression complete">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-[var(--color-text-subtle)]">Original</p>
                                    <p className="font-medium text-[var(--color-text)]">{formatBytes(file.size)}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--color-text-subtle)]">Compressed</p>
                                    <p className="font-medium text-[var(--color-text)]">{formatBytes(result.blob.size)}</p>
                                </div>
                                <div>
                                    <p className="text-[var(--color-text-subtle)]">Saved</p>
                                    <p className="font-medium text-success">{saved}%</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <a href={result.url} download={result.filename}>
                                    <PrimaryButton>Download</PrimaryButton>
                                </a>
                                <SecondaryButton onClick={reset}>Compress Another</SecondaryButton>
                            </div>
                        </SuccessState>
                    )}
                </div>
            )}
        </div>
    )
}
