import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({ className, ...props }: Props) {
    return (
        <button
            type="button"
            className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors',
                'hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    )
}
