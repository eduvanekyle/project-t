import { Loader2 } from 'lucide-react'

export function ProcessingState({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={18} className="animate-spin text-accent" aria-hidden="true" />
            <span>{label}</span>
        </div>
    )
}
