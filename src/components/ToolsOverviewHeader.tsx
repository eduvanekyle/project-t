import type { ReactNode } from 'react'

interface Props {
    icon: ReactNode
    title: string
    description: string
    toolCount: number
}

export function ToolsOverviewHeader({ icon, title, description, toolCount }: Props) {
    return (
        <div className="flex flex-col gap-6 border-b border-[var(--color-border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-[var(--color-accent-soft)] text-accent">
                        {icon}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
                        Browser tools
                    </p>
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--color-text)]">{title}</h1>
                <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">{description}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
                <p className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">{toolCount}</p>
                <p className="text-sm text-[var(--color-text-muted)]">tools, ready to use</p>
            </div>
        </div>
    )
}