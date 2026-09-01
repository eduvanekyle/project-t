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
    ACCEPTED_EXCEL_TYPES,
    convertExcel,
    detectExcelFormat,
    type ExcelFormat,
    formatLabel,
    replaceExtension,
} from '../lib/excelProcessing'

const FORMAT_OPTIONS: { value: ExcelFormat; label: string }[] = [
    { value: 'xlsx', label: 'XLSX' },
    { value: 'xls', label: 'XLS' },
    { value: 'csv', label: 'CSV' },
]

interface Result {
    blob: Blob
    url: string
    filename: string
}

export function ExcelConverter() {
    const [file, setFile] = useState<File | null>(null)
    const [sourceFormat, setSourceFormat] = useState<ExcelFormat | null>(null)
    const [targetFormat, setTargetFormat] = useState<ExcelFormat | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)

    const handleFiles = (files: File[]) => {
        const selected = files[0]
        const format = detectExcelFormat(selected)
        if (!format) {
            setError('This file format is not supported. Please upload an XLSX, XLS, or CSV file.')
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
            const blob = await convertExcel(file, targetFormat)
            setResult({ blob, url: URL.createObjectURL(blob), filename: replaceExtension(file.name, targetFormat) })
        } catch {
            setError('Something went wrong while converting your file. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/excel-tools"
                backLabel="Back to tools"
                title="Excel Converter"
                description="Convert between XLSX, XLS, and CSV files."
            />

            {!file && (
                <FileDropzone
                    accept={ACCEPTED_EXCEL_TYPES.join(',')}
                    formatsLabel="XLSX, XLS, CSV • Max size: 25 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && sourceFormat && (
                <div className="flex flex-col gap-6">
                    <FilePreview file={file} formatLabel={formatLabel(sourceFormat)} onRemove={reset} kind="document" />

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
                                Convert File
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Converting your file…" />}

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
