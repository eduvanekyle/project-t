import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export function SecondaryButton({ className, ...props }: Props) {
    return (
        <button
            type="button"
            className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors',
                'hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    )
}
