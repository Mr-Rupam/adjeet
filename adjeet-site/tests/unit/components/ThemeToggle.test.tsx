import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Mock localStorage
const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => storage[k] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { storage[k] = v })
  Object.keys(storage).forEach(k => delete storage[k])
  // Reset data-theme attribute
  document.documentElement.removeAttribute('data-theme')
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

  it('cycles light → dark → system on successive clicks', () => {
    storage['adjeet-theme'] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('dark')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('system')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('light')
  })

  it('has accessible label describing current theme', () => {
    storage['adjeet-theme'] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toContain('light')
  })
})
