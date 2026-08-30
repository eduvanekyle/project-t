import { FileText, ImageIcon, X } from 'lucide-react'
import { formatBytes } from '../lib/format'

interface Props {
    file: File
    formatLabel: string
    onRemove?: () => void
    kind?: 'image' | 'document'
}

export function FilePreview({ file, formatLabel, onRemove, kind = 'image' }: Props) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-subtle)]">
                {kind === 'image' ? <ImageIcon size={18} aria-hidden="true" /> : <FileText size={18} aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text)]">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {formatLabel} • {formatBytes(file.size)}
                </p>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove file"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--color-text-subtle)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            )}
        </div>
    )
}
