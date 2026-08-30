import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string
    icon: ReactNode
}

export function IconButton({ label, icon, className, ...props }: Props) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={clsx(
                'inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors',
                'hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
                className,
            )}
            {...props}
        >
            {icon}
        </button>
    )
}
