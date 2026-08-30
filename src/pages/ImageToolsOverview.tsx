import { ImageIcon, Shrink } from 'lucide-react'
import { ToolCard } from '../components/ToolCard'
import { tools } from '../lib/tools'

const ICONS: Record<string, React.ReactNode> = {
    'image-converter': <ImageIcon size={18} aria-hidden="true" />,
    'image-compressor': <Shrink size={18} aria-hidden="true" />,
}

export function ImageToolsOverview() {
    const imageTools = tools.filter((tool) => tool.category === 'image')

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
                Image Tools
            </h1>
            <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
                Convert between formats or reduce file size, entirely in your browser.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {imageTools.map((tool) => (
                    <ToolCard
                        key={tool.slug}
                        icon={ICONS[tool.slug]}
                        name={tool.name}
                        description={tool.description}
                        to={tool.path}
                    />
                ))}
            </div>
        </div>
    )
}
