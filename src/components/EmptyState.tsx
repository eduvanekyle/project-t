import type { ReactNode } from 'react'

interface Props {
    icon: ReactNode
    title: string
    description: string
    action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <div className="text-[var(--color-text-subtle)]">{icon}</div>
            <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
            </div>
            {action}
        </div>
    )
}
