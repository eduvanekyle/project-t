import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FormatSelector } from '../components/FormatSelector'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import {
    ACCEPTED_EXCEL_TYPES,
    detectExcelFormat,
    type ExcelFormat,
    formatLabel,
    type SheetSplitResult,
    splitExcelSheets,
} from '../lib/excelProcessing'

const FORMAT_OPTIONS: { value: ExcelFormat; label: string }[] = [
    { value: 'xlsx', label: 'XLSX' },
    { value: 'xls', label: 'XLS' },
    { value: 'csv', label: 'CSV' },
]

const EXTENSION_BY_FORMAT: Record<ExcelFormat, string> = {
    xlsx: '.xlsx',
    xls: '.xls',
    csv: '.csv',
}

export function SplitExcel() {
    const [file, setFile] = useState<File | null>(null)
    const [sourceFormat, setSourceFormat] = useState<ExcelFormat | null>(null)
    const [targetFormat, setTargetFormat] = useState<ExcelFormat>('xlsx')
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [results, setResults] = useState<SheetSplitResult[] | null>(null)

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
        setResults(null)
    }

    const reset = () => {
        setFile(null)
        setSourceFormat(null)
        setTargetFormat('xlsx')
        setResults(null)
        setError(null)
    }

    const handleSplit = async () => {
        if (!file) return
        setProcessing(true)
        setError(null)
        try {
            const split = await splitExcelSheets(file, targetFormat)
            setResults(split)
        } catch {
            setError('Something went wrong while splitting your file. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    const handleDownloadAll = async () => {
        if (!results || !file) return
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        const base = file.name.replace(/\.[^./]+$/, '')
        for (const result of results) {
            zip.file(`${result.sheetName}${EXTENSION_BY_FORMAT[targetFormat]}`, result.blob)
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${base}-sheets.zip`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/excel-tools"
                backLabel="Back to tools"
                title="Split Excel"
                description="Turn every sheet in a workbook into its own file."
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
                    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                                {formatBytes(file.size)} • {formatLabel(sourceFormat)}
                            </p>
                        </div>
                        <SecondaryButton onClick={reset}>Remove</SecondaryButton>
                    </div>

                    {!results && (
                        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                                Output format
                            </p>
                            <div className="mt-3">
                                <FormatSelector options={FORMAT_OPTIONS} value={targetFormat} onChange={setTargetFormat} />
                            </div>
                            <PrimaryButton className="mt-5 w-full sm:w-auto" onClick={handleSplit} disabled={isProcessing}>
                                Split Sheets
                            </PrimaryButton>
                        </div>
                    )}

                    {isProcessing && <ProcessingState label="Splitting your workbook…" />}
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
                                    const filename = `${result.sheetName}${EXTENSION_BY_FORMAT[targetFormat]}`
                                    return (
                                        <div
                                            key={result.sheetName}
                                            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--color-text)]">{filename}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{formatBytes(result.blob.size)}</p>
                                            </div>
                                            <a href={url} download={filename} className="text-xs font-medium text-accent hover:underline">
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
