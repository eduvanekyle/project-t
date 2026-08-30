import { UploadCloud } from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import clsx from 'clsx'
import { PrimaryButton } from './PrimaryButton'

interface Props {
    accept: string
    multiple?: boolean
    formatsLabel: string
    onFiles: (files: File[]) => void
    error?: string | null
}

export function FileDropzone({ accept, multiple = false, formatsLabel, onFiles, error }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragActive, setDragActive] = useState(false)

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return
        onFiles(Array.from(fileList))
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragActive(false)
        handleFiles(event.dataTransfer.files)
    }

    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
                }}
                onDragOver={(event) => {
                    event.preventDefault()
                    setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={clsx(
                    'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors',
                    isDragActive
                        ? 'border-accent bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]'
                        : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]',
                )}
            >
                <UploadCloud size={28} className={clsx(isDragActive ? 'text-accent' : 'text-[var(--color-text-subtle)]')} aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Drop your file{multiple ? 's' : ''} here</p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">or browse from your device</p>
                </div>
                <p className="text-xs text-[var(--color-text-subtle)]">{formatsLabel}</p>
                <PrimaryButton
                    onClick={(event) => {
                        event.stopPropagation()
                        inputRef.current?.click()
                    }}
                >
                    Choose file{multiple ? 's' : ''}
                </PrimaryButton>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    onChange={(event) => {
                        handleFiles(event.target.files)
                        event.target.value = ''
                    }}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    )
}
