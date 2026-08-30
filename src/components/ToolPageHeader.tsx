import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
    backTo: string
    backLabel: string
    title: string
    description: string
}

export function ToolPageHeader({ backTo, backLabel, title, description }: Props) {
    return (
        <div className="mb-8">
            <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
                <ArrowLeft size={14} aria-hidden="true" />
                {backLabel}
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">{title}</h1>
            <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
        </div>
    )
}
