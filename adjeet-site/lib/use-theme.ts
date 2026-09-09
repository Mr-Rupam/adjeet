'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEY, type ResolvedTheme } from '@/lib/theme'

/**
 * Read the live theme, whoever set it.
 *
 * ThemeToggle keeps its own local state and writes `data-theme` on <html>,
 * so there is no store to subscribe to. Watching the attribute instead means
 * any future control (a second toggle, a deep link, a system-preference
 * change) is picked up for free, with no coupling to the button that did it.
 *
 * The `storage` listener keeps a second tab in step, since that fires only in
 * the tabs that did not perform the write.
 */
export function useTheme(): ResolvedTheme {
  const [theme, setTheme] = useState<ResolvedTheme>('light')

  useEffect(() => {
    const root = document.documentElement
    const read = (): ResolvedTheme =>
      root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(read())

    const observer = new MutationObserver(() => setTheme(read()))
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setTheme(read())
    }
    window.addEventListener('storage', onStorage)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return theme
}
