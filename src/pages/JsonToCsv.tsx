import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FilePreview } from '../components/FilePreview'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { convertJsonToCsv, getJsonParseError, MAX_JSON_FILE_SIZE } from '../lib/jsonProcessing'

interface Result {
    blob: Blob
    url: string
    filename: string
}

export function JsonToCsv() {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)

    const handleFiles = async (files: File[]) => {
        const selected = files[0]
        if (!selected) return
        if (selected.size > MAX_JSON_FILE_SIZE) {
            setError('This file is too large. JSON files must be 30 MB or smaller.')
            return
        }

        const looksLikeJson = selected.type === 'application/json' || /\.json$/i.test(selected.name)
        if (!looksLikeJson) {
            try {
                JSON.parse(await selected.text())
            } catch (error) {
                setError(getJsonParseError(error))
                return
            }
        }

        setFile(selected)
        setResult(null)
        setError(null)
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setResult(null)
        setError(null)
    }

    const handleConvert = async () => {
        if (!file) return
        setProcessing(true)
        setError(null)
        try {
            const blob = await convertJsonToCsv(file)
            const base = file.name.replace(/\.json$/i, '')
            setResult({ blob, url: URL.createObjectURL(blob), filename: `${base}.csv` })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong while converting your JSON file.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/excel-tools"
                backLabel="Back to tools"
                title="JSON to CSV"
                description="Convert JSON records into a CSV file directly in your browser."
            />

            {!file && (
                <FileDropzone
                    accept=".json,application/json,text/plain"
                    formatsLabel="JSON • Max size: 30 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && (
                <div className="flex flex-col gap-6">
                    <FilePreview file={file} formatLabel="JSON" onRemove={reset} kind="document" />

                    {!result && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Arrays of objects become rows. Nested objects become dotted column names, and arrays remain in their cells as JSON.
                            </p>
                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleConvert} disabled={isProcessing}>
                                Convert to CSV
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Converting your JSON file…" />}
                    {error && <p className="text-sm text-danger">{error}</p>}

                    {result && (
                        <SuccessState title="Conversion complete">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {result.filename} • {formatBytes(result.blob.size)}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <a href={result.url} download={result.filename}>
                                    <PrimaryButton>Download CSV</PrimaryButton>
                                </a>
                                <SecondaryButton onClick={reset}>Convert Another</SecondaryButton>
                            </div>
                        </SuccessState>
                    )}
                </div>
            )}
        </div>
    )
}