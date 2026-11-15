import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { STORAGE_KEY } from '@/lib/theme'

// Mock analytics so we can assert the toggle fires a tracking event
vi.mock('@/lib/analytics', () => ({
  trackThemeToggle: vi.fn(),
}))

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { registerThemeScene } from '@/lib/theme-switch'
import { trackThemeToggle } from '@/lib/analytics'

// Mock localStorage
const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => storage[k] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { storage[k] = v })
  Object.keys(storage).forEach(k => delete storage[k])
  // Reset data-theme attribute
  document.documentElement.removeAttribute('data-theme')
  vi.mocked(trackThemeToggle).mockClear()
  // Mock matchMedia for jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
})

// The switch is applied once any scene on screen is ready (lib/theme-switch.ts), so a click settles asynchronously.
const click = async (element: HTMLElement) => { await act(async () => { fireEvent.click(element) }) }

describe('ThemeToggle', () => {
  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('cycles light → dark → light on successive clicks', async () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')

    await click(btn)
    expect(storage[STORAGE_KEY]).toBe('dark')

    await click(btn)
    expect(storage[STORAGE_KEY]).toBe('light')
  })

  it('applies the resolved theme to document.documentElement', async () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    await click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    await click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('has an accessible label naming the destination theme', async () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode')

    await click(btn)
    expect(btn.getAttribute('aria-label')).toBe('Switch to light mode')
  })

  it('fires trackThemeToggle with the newly-applied theme', async () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    await click(screen.getByRole('button'))
    expect(trackThemeToggle).toHaveBeenCalledWith('dark')

    await click(screen.getByRole('button'))
    expect(trackThemeToggle).toHaveBeenCalledWith('light')
  })

  it('announces a visitor-initiated theme change so the hero can play its matching film', async () => {
    storage[STORAGE_KEY] = 'light'
    const listener = vi.fn()
    window.addEventListener('adjeet:theme-toggle', listener)

    render(<ThemeToggle />)
    await click(screen.getByRole('button'))

    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe('dark')
    window.removeEventListener('adjeet:theme-toggle', listener)
  })

  it('changes nothing until a scene on screen has its incoming image ready, then everything at once', async () => {
    storage[STORAGE_KEY] = 'light'
    document.documentElement.setAttribute('data-theme', 'light')
    let ready!: () => void
    const events: string[] = []
    const unregister = registerThemeScene({
      near: () => true,
      prepare: () => new Promise<void>(resolve => { ready = resolve }),
      commit: theme => events.push(`scene ${theme}, root ${document.documentElement.getAttribute('data-theme')}`),
    })
    render(<ThemeToggle />)
    await click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(events).toEqual([])
    await act(async () => { ready() })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(events).toEqual(['scene dark, root dark'])
    unregister()
  })
})
