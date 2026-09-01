import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
    title: string
    children?: ReactNode
}

export function SuccessState({ title, children }: Props) {
    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 size={18} aria-hidden="true" />
                {title}
            </div>
            {children && <div className="mt-4">{children}</div>}
        </div>
    )
}
