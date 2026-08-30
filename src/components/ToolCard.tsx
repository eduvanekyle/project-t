import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
    icon: ReactNode
    name: string
    description: string
    to: string
}

export function ToolCard({ icon, name, description, to }: Props) {
    return (
        <Link
            to={to}
            className="group flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:-translate-y-0.5"
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-accent">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">{name}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-accent">
                Open tool
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
        </Link>
    )
}
