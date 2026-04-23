import { describe, it, expect } from 'vitest'

describe('Vitest setup', () => {
  it('runs in jsdom environment', () => {
    expect(typeof document).toBe('object')
  })

  it('can resolve @/ alias', async () => {
    // If this import fails, the alias is not configured correctly
    const { default: path } = await import('path')
    expect(typeof path.resolve).toBe('function')
  })
})
