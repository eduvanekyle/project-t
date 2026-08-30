import clsx from 'clsx'

interface Props<T extends string> {
    options: { value: T; label: string }[]
    value: T | null
    onChange: (value: T) => void
    disabledValue?: T
}

export function FormatSelector<T extends string>({ options, value, onChange, disabledValue }: Props<T>) {
    return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Convert to format">
            {options.map((option) => {
                const isDisabled = option.value === disabledValue
                const isSelected = option.value === value
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={isDisabled}
                        onClick={() => onChange(option.value)}
                        className={clsx(
                            'rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                            isSelected
                                ? 'border-accent bg-accent text-white'
                                : 'border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
