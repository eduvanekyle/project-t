import { useRef, useState } from 'react'
import { FileDropzone } from '../components/FileDropzone'
import { PrimaryButton } from '../components/PrimaryButton'
import { ProcessingState } from '../components/ProcessingState'
import { SecondaryButton } from '../components/SecondaryButton'
import { type SortableFile, SortableFileList } from '../components/SortableFileList'
import { SuccessState } from '../components/SuccessState'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { formatBytes } from '../lib/format'
import { generateId } from '../lib/id'
import { getPdfPageCount, mergePdfs } from '../lib/pdfProcessing'

interface Result {
    blob: Blob
    url: string
}

export function MergePdf() {
    const [items, setItems] = useState<SortableFile[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setProcessing] = useState(false)
    const [result, setResult] = useState<Result | null>(null)
    const nextInputRef = useRef<HTMLInputElement>(null)

    const addFiles = (files: File[]) => {
        const pdfFiles = files.filter((file) => file.type === 'application/pdf')
        if (pdfFiles.length === 0) {
            setError('This file format is not supported. Please upload PDF files only.')
            return
        }
        setError(null)
        setResult(null)

        const newItems: SortableFile[] = pdfFiles.map((file) => ({
            id: generateId(),
            file,
        }))
        setItems((current) => [...current, ...newItems])

        for (const item of newItems) {
            getPdfPageCount(item.file)
                .then((pageCount) => {
                    setItems((current) => current.map((i) => (i.id === item.id ? { ...i, pageCount } : i)))
                })
                .catch(() => {
                    /* leave page count undefined if it can't be read */
                })
        }
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
            const blob = await mergePdfs(items.map((item) => item.file))
            setResult({ blob, url: URL.createObjectURL(blob) })
        } catch (err) {
            console.error('PDF merge error:', err)
            setError('Something went wrong while merging your PDFs. Please try again.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 pb-28 sm:px-6">
            <ToolPageHeader
                backTo="/pdf-tools"
                backLabel="Back to tools"
                title="Merge PDF"
                description="Combine multiple PDF files into one document."
            />

            {items.length === 0 && (
                <FileDropzone
                    accept="application/pdf"
                    multiple
                    formatsLabel="PDF • Max size: 50 MB per file"
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
                        accept="application/pdf"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                            if (event.target.files) addFiles(Array.from(event.target.files))
                            event.target.value = ''
                        }}
                    />

                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    {isProcessing && <ProcessingState label="Merging your PDFs…" />}
                </div>
            )}

            {result && (
                <SuccessState title="Merge complete">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        merged.pdf • {formatBytes(result.blob.size)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a href={result.url} download="merged.pdf">
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
                            Merge PDFs
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </div>
    )
}
