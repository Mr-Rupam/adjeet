'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEY, ThemePreference } from '@/lib/theme'

const CYCLE: ThemePreference[] = ['light', 'dark', 'system']

const ICONS: Record<ThemePreference, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
}

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as ThemePreference) ?? 'system'
}

function applyTheme(pref: ThemePreference) {
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const resolved = pref === 'system' ? sys : pref
  document.documentElement.setAttribute('data-theme', resolved)
  localStorage.setItem(STORAGE_KEY, pref)
}

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>('system')

  useEffect(() => {
    setPref(readPreference())
  }, [])

  function cycle() {
    const next = CYCLE[(CYCLE.indexOf(pref) + 1) % CYCLE.length]
    setPref(next)
    applyTheme(next)
  }

  return (
    <button
      onClick={cycle}
      aria-label={`Current theme: ${pref}. Click to change.`}
      className="rounded p-2 text-ink-muted hover:text-ink transition-colors"
    >
      <span aria-hidden="true">{ICONS[pref]}</span>
    </button>
  )
}
