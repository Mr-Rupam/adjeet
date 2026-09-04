import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShutterText } from '@/components/street/ShutterText'

// Framer Motion is mocked to avoid animation in tests
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => <span {...p}>{children}</span>,
  },
  useReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}))

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

describe('ShutterText', () => {
  it('renders the literal text when motion is reduced', () => {
    mockReducedMotion(true)
    const { container } = render(<ShutterText text="AD JEET" />)
    // Spaces render as U+00A0 by design, so the wordmark never breaks across
    // a line — assert that contract rather than normalising it away.
    expect(container.textContent).toBe('AD\u00A0JEET')
    expect(screen.getByText('J')).toBeTruthy()
    // "AD JEET" has two E's, so getAllByText — getByText would throw on the duplicate
    expect(screen.getAllByText('E')).toHaveLength(2)
  })

  it('applies charClassName only to the matching character (reduced motion)', () => {
    mockReducedMotion(true)
    render(<ShutterText text="AD JEET" charClassName={char => (char === 'J' ? 'text-signal' : undefined)} />)
    expect(screen.getByText('J').className).toContain('text-signal')
    expect(screen.getByText('A').className).not.toContain('text-signal')
  })

  it('exposes the full string as an accessible name via role=text when animated', () => {
    mockReducedMotion(false)
    render(<ShutterText text="AD JEET" />)
    expect(screen.getByRole('text', { name: 'AD JEET' })).toBeTruthy()
  })
})
