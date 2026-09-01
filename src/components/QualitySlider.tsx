interface Props {
    value: number
    onChange: (value: number) => void
    label?: string
}

export function QualitySlider({ value, onChange, label = 'Compression quality' }: Props) {
    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text)]">{label}</span>
                <span className="text-[var(--color-text-muted)]">{value}%</span>
            </div>
            <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[var(--color-accent)]"
                aria-label={label}
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--color-text-subtle)]">
                <span>Low</span>
                <span>High</span>
            </div>
        </div>
    )
}
