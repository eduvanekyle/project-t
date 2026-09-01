import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FilePreview } from '../components/FilePreview'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { QualitySlider } from '../components/QualitySlider'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { ACCEPTED_IMAGE_TYPES, compressImage, detectImageFormat, formatLabel } from '../lib/imageProcessing'

interface Result {
    blob: Blob
    url: string
    filename: string
}

export function ImageCompressor() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [quality, setQuality] = useState(80)
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
        setPreview(URL.createObjectURL(selected))
        setResult(null)
    }

    const reset = () => {
        if (preview) URL.revokeObjectURL(preview)
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setPreview(null)
        setResult(null)
        setError(null)
        setQuality(80)
    }

    const handleCompress = async () => {
        if (!file) return
        setProcessing(true)
        setError(null)
        try {
            const blob = await compressImage(file, quality / 100)
            const base = file.name.replace(/\.[^./]+$/, '')
            setResult({ blob, url: URL.createObjectURL(blob), filename: `${base}-compressed.jpg` })
        } catch {
            setError('Something went wrong while compressing your image. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const saved = result && file ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100)) : null

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/image-tools"
                backLabel="Back to tools"
                title="Image Compressor"
                description="Reduce image file size while controlling quality."
            />

            {!file && (
                <FileDropzone
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    formatsLabel="PNG, JPG, WebP • Max size: 25 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && (
                <div className="flex flex-col gap-6">
                    <FilePreview file={file} formatLabel={formatLabel(detectImageFormat(file) ?? 'jpeg')} onRemove={reset} />

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview of the uploaded image"
                            className="max-h-72 w-full rounded-lg border border-[var(--color-border)] object-contain"
                        />
                    )}

                    {!result && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <QualitySlider value={quality} onChange={setQuality} />
                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleCompress} disabled={isProcessing}>
                                Compress Image
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Compressing your image…" />}

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

            {error && file && <p className="mt-4 text-sm text-danger">{error}</p>}
        </div>
    )
}
