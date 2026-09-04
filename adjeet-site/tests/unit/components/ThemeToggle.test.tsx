import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { STORAGE_KEY } from '@/lib/theme'

// Mock analytics so we can assert the toggle fires a tracking event
vi.mock('@/lib/analytics', () => ({
  trackThemeToggle: vi.fn(),
}))

import { ThemeToggle } from '@/components/ui/ThemeToggle'
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

describe('ThemeToggle', () => {
  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('cycles light → dark → light on successive clicks', () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')

    fireEvent.click(btn)
    expect(storage[STORAGE_KEY]).toBe('dark')

    fireEvent.click(btn)
    expect(storage[STORAGE_KEY]).toBe('light')
  })

  it('applies the resolved theme to document.documentElement', () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('has an accessible label naming the destination theme', () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode')

    fireEvent.click(btn)
    expect(btn.getAttribute('aria-label')).toBe('Switch to light mode')
  })

  it('fires trackThemeToggle with the newly-applied theme', () => {
    storage[STORAGE_KEY] = 'light'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(trackThemeToggle).toHaveBeenCalledWith('dark')

    fireEvent.click(screen.getByRole('button'))
    expect(trackThemeToggle).toHaveBeenCalledWith('light')
  })
})
