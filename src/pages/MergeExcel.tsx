import { useRef, useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { type SortableFile, SortableFileList } from '../components/SortableFileList'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { ACCEPTED_EXCEL_TYPES, detectExcelFormat, type MergeMode, mergeExcelFiles } from '../lib/excelProcessing'
import { generateId } from '../lib/id'

interface Result {
    blob: Blob
    url: string
}

export function MergeExcel() {
    const [items, setItems] = useState<SortableFile[]>([])
    const [mode, setMode] = useState<MergeMode>('rows')
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)
    const nextInputRef = useRef<HTMLInputElement>(null)

    const addFiles = (files: File[]) => {
        const excelFiles = files.filter((file) => detectExcelFormat(file) !== null)
        if (excelFiles.length === 0) {
            setError('This file format is not supported. Please upload XLSX, XLS, or CSV files only.')
            return
        }
        setError(null)
        setResult(null)

        const newItems: SortableFile[] = excelFiles.map((file) => ({
            id: generateId(),
            file,
        }))
        setItems((current) => [...current, ...newItems])
    }

    const removeItem = (id: string) => {
        setItems((current) => current.filter((item) => item.id !== id))
    }

    const reset = () => {
        if (result) URL.revokeObjectURL(result.url)
        setItems([])
        setResult(null)
        setError(null)
    }

    const handleMerge = async () => {
        if (items.length < 2) return
        setProcessing(true)
        setError(null)
        try {
            const blob = await mergeExcelFiles(items.map((item) => item.file), mode)
            setResult({ blob, url: URL.createObjectURL(blob) })
        } catch {
            setError('Something went wrong while merging your files. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 pb-28 sm:px-6">
            <ToolPageHeader
                backTo="/excel-tools"
                backLabel="Back to tools"
                title="Merge Excel"
                description="Combine multiple spreadsheets into one file."
            />

            {items.length === 0 && (
                <FileDropzone
                    accept={ACCEPTED_EXCEL_TYPES.join(',')}
                    multiple
                    formatsLabel="XLSX, XLS, CSV • Max size: 25 MB per file"
                    onFiles={addFiles}
                    error={error}
                />
            )}

            {items.length > 0 && !result && (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {items.length} file{items.length === 1 ? '' : 's'} • The files will be merged in this order.
                    </p>

                    <SortableFileList items={items} onReorder={setItems} onRemove={removeItem} />

                    <SecondaryButton onClick={() => nextInputRef.current?.click()} className="self-start">
                        Add more files
                    </SecondaryButton>
                    <input
                        ref={nextInputRef}
                        type="file"
                        accept={ACCEPTED_EXCEL_TYPES.join(',')}
                        multiple
                        className="hidden"
                        onChange={(event) => {
                            if (event.target.files) addFiles(Array.from(event.target.files))
                            event.target.value = ''
                        }}
                    />

                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                            Merge mode
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                <input type="radio" name="mode" checked={mode === 'rows'} onChange={() => setMode('rows')} />
                                Combine rows into one sheet
                            </label>
                            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                <input type="radio" name="mode" checked={mode === 'sheets'} onChange={() => setMode('sheets')} />
                                Keep each file as a separate sheet
                            </label>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    {isProcessing && <ProcessingState label="Merging your files…" />}
                </div>
            )}

            {result && (
                <SuccessState title="Merge complete">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        merged.xlsx • {formatBytes(result.blob.size)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href={result.url} download="merged.xlsx">
                            <PrimaryButton>Download</PrimaryButton>
                        </a>
                        <SecondaryButton onClick={reset}>Merge More Files</SecondaryButton>
                    </div>
                </SuccessState>
            )}

            {items.length > 0 && !result && (
                <div className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 p-4 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="mx-auto max-w-2xl">
                        <PrimaryButton
                            className="w-full sm:w-auto"
                            onClick={handleMerge}
                            disabled={items.length < 2 || isProcessing}
                        >
                            Merge Files
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    )
}
