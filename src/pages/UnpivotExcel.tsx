import { useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { FilePreview } from '../components/FilePreview'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import {
    ACCEPTED_EXCEL_TYPES,
    detectExcelFormat,
    getExcelHeaders,
    type UnpivotOptions,
    unpivotExcel,
} from '../lib/excelProcessing'

interface Result {
    blob: Blob
    url: string
}

export function UnpivotExcel() {
    const [file, setFile] = useState<File | null>(null)
    const [headers, setHeaders] = useState<string[]>([])
    const [identifierColumnIndexes, setIdentifierColumnIndexes] = useState<number[]>([])
    const [skipNullValues, setSkipNullValues] = useState(false)
    const [headerRow, setHeaderRow] = useState(1)
    const [dataStartRow, setDataStartRow] = useState(2)
    const [error, setError] = useState<string | null>(null)
    const [isLoadingHeaders, setLoadingHeaders] = useState(false)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)

    const loadHeaders = async (selectedFile: File, row: number) => {
        setLoadingHeaders(true)
        try {
            const nextHeaders = await getExcelHeaders(selectedFile, row)
            if (nextHeaders.length === 0) {
                setError('The selected header row does not contain any columns.')
                setHeaders([])
                setIdentifierColumnIndexes([])
                return
            }
            setHeaders(nextHeaders)
            setIdentifierColumnIndexes(nextHeaders.length > 1 ? [0] : [])
            setError(null)
        } catch {
            setError('Something went wrong while reading the spreadsheet headers. Please try again.')
        } finally {
            setLoadingHeaders(false)
        }
    }

    const handleFiles = async (files: File[]) => {
        const selected = files[0]
        if (!selected || !detectExcelFormat(selected)) {
            setError('This file format is not supported. Please upload an XLSX, XLS, or CSV file.')
            return
        }
        setFile(selected)
        setResult(null)
        setError(null)
        await loadHeaders(selected, headerRow)
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setFile(null)
        setHeaders([])
        setIdentifierColumnIndexes([])
        setResult(null)
        setError(null)
    }

    const toggleIdentifier = (index: number) => {
        setIdentifierColumnIndexes((current) =>
            current.includes(index) ? current.filter((columnIndex) => columnIndex !== index) : [...current, index],
        )
    }

    const handleHeaderRowChange = async (value: number) => {
        const nextRow = Math.max(1, value || 1)
        setHeaderRow(nextRow)
        setDataStartRow((current) => Math.max(current, nextRow + 1))
        if (file) await loadHeaders(file, nextRow)
    }

    const handleUnpivot = async () => {
        if (!file) return
        if (identifierColumnIndexes.length >= headers.length) {
            setError('Select at least one value column to unpivot.')
            return
        }

        setProcessing(true)
        setError(null)
        try {
            const options: UnpivotOptions = { headerRow, dataStartRow, identifierColumnIndexes, skipNullValues }
            const blob = await unpivotExcel(file, options)
            setResult({ blob, url: URL.createObjectURL(blob) })
        } catch {
            setError('Something went wrong while unpivoting your file. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/excel-tools"
                backLabel="Back to tools"
                title="Unpivot Excel"
                description="Turn columns into attribute and value rows while keeping selected identifier columns." 
            />

            {!file && (
                <FileDropzone
                    accept={ACCEPTED_EXCEL_TYPES.join(',')}
                    formatsLabel="XLSX, XLS, CSV • Max size: 25 MB"
                    onFiles={handleFiles}
                    error={error}
                />
            )}

            {file && !result && (
                <div className="flex flex-col gap-6">
                    <FilePreview file={file} formatLabel="Excel" onRemove={reset} kind="document" />

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                            Source layout
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4">
                            <label className="flex flex-col gap-1 text-sm text-[var(--color-text)]">
                                Header row
                                <input
                                    type="number"
                                    min={1}
                                    value={headerRow}
                                    onChange={(event) => void handleHeaderRowChange(Number(event.target.value))}
                                    className="w-24 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm text-[var(--color-text)]">
                                Data starts at row
                                <input
                                    type="number"
                                    min={headerRow + 1}
                                    value={dataStartRow}
                                    onChange={(event) =>
                                        setDataStartRow(Math.max(headerRow + 1, Number(event.target.value) || headerRow + 1))
                                    }
                                    className="w-24 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
                                />
                            </label>
                            <label className="flex items-center gap-2 self-end pb-1 text-sm text-[var(--color-text)]">
                                <input
                                    type="checkbox"
                                    checked={skipNullValues}
                                    onChange={(event) => setSkipNullValues(event.target.checked)}
                                />
                                Skip null values
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                            Identifier columns
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            These columns stay as-is. Every other column becomes an Attribute and Value row.
                        </p>
                        {isLoadingHeaders ? (
                            <p className="mt-4 text-sm text-[var(--color-text-muted)]">Reading columns…</p>
                        ) : (
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {headers.map((header, index) => (
                                    <label key={`${header}-${index}`} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                        <input
                                            type="checkbox"
                                            checked={identifierColumnIndexes.includes(index)}
                                            onChange={() => toggleIdentifier(index)}
                                        />
                                        <span className="truncate">{header}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-danger">{error}</p>}
                    {isProcessing && <ProcessingState label="Unpivoting your spreadsheet…" />}
                    <PrimaryButton onClick={handleUnpivot} disabled={isLoadingHeaders || isProcessing || headers.length < 2}>
                        Unpivot Spreadsheet
                    </PrimaryButton>
                </div>
            )}

            {result && (
                <SuccessState title="Unpivot complete">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        unpivoted.xlsx • {formatBytes(result.blob.size)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href={result.url} download="unpivoted.xlsx">
                            <PrimaryButton>Download XLSX</PrimaryButton>
                        </a>
                        <SecondaryButton onClick={reset}>Unpivot Another</SecondaryButton>
                    </div>
                </SuccessState>
            )}
        </div>
    )
}