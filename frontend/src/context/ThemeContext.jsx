import { createContext, useContext, useState, useLayoutEffect } from 'react'

const ThemeContext = createContext()
const THEME_STORAGE_KEY = 'theme'

function applyTheme(nextTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  document.documentElement.setAttribute('data-theme', nextTheme)
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    const initialTheme = saved === 'light' || saved === 'dark' ? saved : 'dark'
    applyTheme(initialTheme)
    return initialTheme
  })

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(nextTheme)
      return nextTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
