import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { IconButton } from './IconButton'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <IconButton
            label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            onClick={toggleTheme}
        />
    )
}
