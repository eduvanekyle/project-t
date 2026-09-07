import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
    icon: ReactNode
    name: string
    description: string
    to: string
    category?: 'image' | 'pdf' | 'excel'
}

const logoColorClasses = {
    image: 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400',
    pdf: 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400',
    excel: 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400',
}

export function ToolCard({ icon, name, description, to, category }: Props) {
    return (
        <Link
            to={to}
            className="group flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:-translate-y-0.5"
        >
            <div
                className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                    category ? logoColorClasses[category] : 'border-[var(--color-border)] text-accent'
                }`}
            >
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">{name}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
            </div>
        </Link>
    )
}
