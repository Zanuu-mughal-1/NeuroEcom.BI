import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
      style={{ 
        background: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
        color: 'var(--color-neo-bright)'
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
          }`} 
        />
        <Moon 
          size={20} 
          className={`absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
          }`} 
        />
      </div>
    </button>
  )
}
