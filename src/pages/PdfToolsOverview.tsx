import { FileStack, Images } from 'lucide-react'
import { ToolCard } from '../components/ToolCard'
import { tools } from '../lib/tools'

const ICONS: Record<string, React.ReactNode> = {
    'merge-pdf': <FileStack size={18} aria-hidden="true" />,
    'pdf-to-image': <Images size={18} aria-hidden="true" />,
}

export function PdfToolsOverview() {
    const pdfTools = tools.filter((tool) => tool.category === 'pdf')

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
                PDF Tools
            </h1>
            <p className="mt-2 max-w-xl text-[var(--color-text-muted)]">
                Merge documents or export pages as images, without uploading files to a server.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pdfTools.map((tool) => (
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
