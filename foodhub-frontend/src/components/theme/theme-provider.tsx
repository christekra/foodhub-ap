'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system', 
  enableSystem = true 
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light')

  // Détecter le thème système
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Appliquer le thème
  const applyTheme = React.useCallback((newTheme: Theme) => {
    const root = document.documentElement
    let resolved: 'light' | 'dark'

    if (newTheme === 'system' && enableSystem) {
      resolved = getSystemTheme()
    } else {
      resolved = newTheme as 'light' | 'dark'
    }

    // Supprimer les classes existantes
    root.classList.remove('light', 'dark')
    
    // Ajouter la nouvelle classe
    root.classList.add(resolved)
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }

    setResolvedTheme(resolved)
  }, [enableSystem])

  // Initialiser le thème
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const initialTheme = savedTheme || defaultTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [defaultTheme, applyTheme])

  // Écouter les changements de thème système
  React.useEffect(() => {
    if (theme === 'system' && enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, enableSystem, applyTheme])

  // Fonction pour changer le thème
  const handleSetTheme = React.useCallback((newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  const value = React.useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    resolvedTheme
  }), [theme, handleSetTheme, resolvedTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook pour utiliser le thème
export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

