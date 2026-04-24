import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConsentBanner } from '@/components/ui/ConsentBanner'

const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => storage[k] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { storage[k] = v })
  Object.keys(storage).forEach(k => delete storage[k])
})

describe('ConsentBanner', () => {
  it('renders when no consent stored', () => {
    render(<ConsentBanner />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('does not render when consent already accepted', () => {
    storage['adjeet-consent'] = 'accepted'
    render(<ConsentBanner />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('hides on Accept and stores accepted', () => {
    render(<ConsentBanner />)
    fireEvent.click(screen.getByText(/accept/i))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('accepted')
  })

  it('hides on Decline and stores declined', () => {
    render(<ConsentBanner />)
    fireEvent.click(screen.getByText(/decline/i))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('declined')
  })
})
