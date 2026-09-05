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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      title={theme === 'light' ? 'See the signs at night' : 'Back to daylight'}
      className="spec inline-flex h-11 items-center border-2 border-ink px-3 text-ink-muted transition-colors hover:bg-ink hover:text-paper"
    >
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            theme === 'light' ? 'bg-ink-subtle' : 'bg-signal shadow-[0_0_8px_1px_rgba(70,175,230,0.9)]'
          }`}
        />
        {theme === 'light' ? 'Night' : 'Day'}
      </span>
    </button>
  )
}

