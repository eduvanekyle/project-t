import { Link } from 'react-router-dom'
import { PrimaryButton } from '../components/PrimaryButton'

export function NotFound() {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">Page not found</h1>
            <p className="text-[var(--color-text-muted)]">The page you're looking for doesn't exist.</p>
            <Link to="/">
                <PrimaryButton>Back to home</PrimaryButton>
            </Link>
        </div>
    )
}
