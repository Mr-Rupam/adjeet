import { describe, it, expect } from 'vitest'
import { resolveTheme, STORAGE_KEY } from '@/lib/theme'

describe('resolveTheme', () => {
  it('returns "light" when preference is "light"', () => {
    expect(resolveTheme('light', 'light')).toBe('light')
  })

  it('returns "dark" when preference is "dark"', () => {
    expect(resolveTheme('dark', 'dark')).toBe('dark')
  })

  it('follows system when preference is "system" and system is dark', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark')
  })

  it('follows system when preference is "system" and system is light', () => {
    expect(resolveTheme('system', 'light')).toBe('light')
  })

  it('exports the correct storage key', () => {
    expect(STORAGE_KEY).toBe('adjeet-theme')
  })
})
