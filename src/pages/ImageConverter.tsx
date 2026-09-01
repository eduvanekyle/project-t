import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FilePreview } from '../components/FilePreview'
import { FormatSelector } from '../components/FormatSelector'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import {
    ACCEPTED_IMAGE_TYPES,
    type ImageFormat,
    convertImage,
    detectImageFormat,
    formatLabel,
    replaceExtension,
} from '../lib/imageProcessing'

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPG' },
    { value: 'webp', label: 'WEBP' },
]

interface Result {
    blob: Blob
    url: string
    filename: string
}

export function ImageConverter() {
    const [file, setFile] = useState<File | null>(null)
    const [sourceFormat, setSourceFormat] = useState<ImageFormat | null>(null)
    const [targetFormat, setTargetFormat] = useState<ImageFormat | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)

    const handleFiles = (files: File[]) => {
        const selected = files[0]
        const format = detectImageFormat(selected)
        if (!format) {
            setError('This file format is not supported. Please upload a PNG, JPG, or WebP image.')
            return
        }
        setError(null)
        setFile(selected)
        setSourceFormat(format)
        setTargetFormat(FORMAT_OPTIONS.find((option) => option.value !== format)?.value ?? null)
        setResult(null)
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setSourceFormat(null)
        setTargetFormat(null)
        setResult(null)
        setError(null)
    }

    const handleConvert = async () => {
        if (!file || !targetFormat) return
        setProcessing(true)
        setError(null)
        try {
            const blob = await convertImage(file, targetFormat)
            setResult({ blob, url: URL.createObjectURL(blob), filename: replaceExtension(file.name, targetFormat) })
        } catch {
            setError('Something went wrong while converting your image. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/image-tools"
                backLabel="Back to tools"
                title="Image Converter"
                description="Convert images between PNG, JPG, and WebP."
            />

            {!file && (
                <FileDropzone
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    formatsLabel="PNG, JPG, WebP • Max size: 25 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && sourceFormat && (
                <div className="flex flex-col gap-6">
                    <FilePreview file={file} formatLabel={formatLabel(sourceFormat)} onRemove={reset} />

                    {!result && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                Convert to
                            </p>
                            <div className="mt-3">
                                <FormatSelector
                                    options={FORMAT_OPTIONS}
                                    value={targetFormat}
                                    onChange={setTargetFormat}
                                    disabledValue={sourceFormat}
                                />
                            </div>
                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleConvert} disabled={isProcessing}>
                                Convert Image
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Converting your image…" />}

                    {result && (
                        <SuccessState title="Conversion complete">
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[var(--color-text)]">{result.filename}</p>
                                    <p className="text-xs text-[var(--color-text-muted)]">{formatBytes(result.blob.size)}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <a href={result.url} download={result.filename}>
                                    <PrimaryButton>Download</PrimaryButton>
                                </a>
                                <SecondaryButton onClick={reset}>Convert Another</SecondaryButton>
                            </div>
                        </SuccessState>
                    )}
                </div>
            )}

            {error && file && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
    )
}
