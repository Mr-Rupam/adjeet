'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEY, type ResolvedTheme } from '@/lib/theme'
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
    setTheme(readTheme())
  }, [])

  function toggle() {
    const next: ResolvedTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    trackThemeToggle(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="rounded p-2 text-ink-muted hover:text-ink transition-colors"
    >
      <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  )
}

