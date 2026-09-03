import { FileSpreadsheet, FileStack, Files, ImageIcon, Images, Shrink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolCard } from '../components/ToolCard'
import { tools } from '../lib/tools'

const ICONS: Record<string, React.ReactNode> = {
    'image-converter': <ImageIcon size={18} aria-hidden="true" />,
    'image-compressor': <Shrink size={18} aria-hidden="true" />,
    'merge-pdf': <FileStack size={18} aria-hidden="true" />,
    'pdf-compressor': <Shrink size={18} aria-hidden="true" />,
    'pdf-to-image': <Images size={18} aria-hidden="true" />,
    'excel-converter': <FileSpreadsheet size={18} aria-hidden="true" />,
    'merge-excel': <Files size={18} aria-hidden="true" />,
}

export function Home() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <section className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
                    Simple tools for working with your files.
                </h1>
                <p className="mt-4 text-lg text-[var(--color-text-muted)]">
                    Convert images, compress files, merge PDFs, turn PDF pages into images, and work with
                    spreadsheets — quickly and without unnecessary complexity.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/image-tools">
                        <PrimaryButton>Explore Image Tools</PrimaryButton>
                    </Link>
                    <Link to="/pdf-tools">
                        <SecondaryButton>Explore PDF Tools</SecondaryButton>
                    </Link>
                    <Link to="/excel-tools">
                        <SecondaryButton>Explore Excel Tools</SecondaryButton>
                    </Link>
                </div>
            </section>

            <section className="mt-14">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                    All tools
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {tools.map((tool) => (
                        <ToolCard
                            key={tool.slug}
                            icon={ICONS[tool.slug]}
                            name={tool.name}
                            description={tool.description}
                            to={tool.path}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}
