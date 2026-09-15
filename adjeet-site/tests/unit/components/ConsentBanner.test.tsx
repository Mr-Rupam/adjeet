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
    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('accepted')
  })

  it('hides on Decline and stores declined', () => {
    render(<ConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('declined')
  })

  it('announces both answers so analytics can switch cookies on or GA4 off', () => {
    const events: string[] = []
    const listener = (event: Event) => events.push((event as CustomEvent).detail)
    window.addEventListener('adjeet:consent', listener)
    render(<ConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    // A stored answer keeps the banner hidden, so clear it before asking again.
    delete storage['adjeet-consent']
    render(<ConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    window.removeEventListener('adjeet:consent', listener)
    expect(events).toEqual(['declined', 'accepted'])
  })
})
