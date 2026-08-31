import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
    { to: '/', label: 'Home', end: true },
    { to: '/image-tools', label: 'Image Tools', end: false },
    { to: '/pdf-tools', label: 'PDF Tools', end: false },
    { to: '/excel-tools', label: 'Excel Tools', end: false },
]

export function AppHeader() {
    const [isMenuOpen, setMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                <NavLink to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
                        T
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text)]">Project T</span>
                </NavLink>

                <nav className="hidden items-center gap-1 sm:flex">
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                clsx(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'text-accent'
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                                )
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] sm:hidden"
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <nav className="border-t border-[var(--color-border)] px-4 py-3 sm:hidden">
                    <div className="flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    clsx(
                                        'rounded-md px-3 py-2 text-sm font-medium',
                                        isActive
                                            ? 'bg-[var(--color-surface-hover)] text-accent'
                                            : 'text-[var(--color-text-muted)]',
                                    )
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                        <span className="text-sm text-[var(--color-text-muted)]">Appearance</span>
                        <ThemeToggle />
                    </div>
                </nav>
            )}
        </header>
    )
}
