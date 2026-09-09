'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { STORAGE_KEY, THEME_TOGGLE_EVENT, type ResolvedTheme } from '@/lib/theme'
import { trackThemeToggle } from '@/lib/analytics'

function readTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'
  // If 'system' or nothing stored, resolve from OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readTheme())
  }, [])

  function toggle() {
    const next: ResolvedTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    window.dispatchEvent(new CustomEvent(THEME_TOGGLE_EVENT, { detail: next }))
    trackThemeToggle(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={theme === 'dark'}
      title={theme === 'light' ? 'See the signs at night' : 'Back to daylight'}
      className="theme-toggle"
      data-theme={theme}
    >
      {theme === 'light' ? <Moon size={18} strokeWidth={1.7} aria-hidden="true" /> : <Sun size={19} strokeWidth={1.7} aria-hidden="true" />}
    </button>
  )
}
