import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
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

/** The glyphs actually painted, in order. They live in data-char, not text. */
function paintedGlyphs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.shutter-char')).map(n => n.getAttribute('data-char'))
}

describe('ShutterText', () => {
  // The wordmark is drawn up to four times per character. If those copies are
  // text nodes they land in the <h1>'s textContent, which is what Google and
  // any text-extraction tool reads. It used to say "AAAADDDD JJJJEEEE...".
  it.each([
    ['reduced motion', true],
    ['animated', false],
  ])('contributes the string exactly once as text (%s)', (_label, reduced) => {
    mockReducedMotion(reduced as boolean)
    const { container } = render(<ShutterText text="AD JEET" />)
    expect(container.textContent).toBe('AD JEET')
  })

  it('paints every character, with spaces as U+00A0 so the wordmark cannot break', () => {
    mockReducedMotion(true)
    const { container } = render(<ShutterText text="AD JEET" />)
    expect(paintedGlyphs(container).join('')).toBe('AD JEET')
  })

  it('draws each character four times when animated: one letter plus three slices', () => {
    mockReducedMotion(false)
    const { container } = render(<ShutterText text="AD JEET" />)
    // 7 characters x 4 layers
    expect(paintedGlyphs(container)).toHaveLength(28)
  })

  it('applies charClassName only to the matching character', () => {
    mockReducedMotion(true)
    const { container } = render(<ShutterText text="AD JEET" charClassName={char => (char === 'J' ? 'text-signal' : undefined)} />)
    const j = container.querySelector('[data-char="J"]')
    const a = container.querySelector('[data-char="A"]')
    expect(j?.className).toContain('text-signal')
    expect(a?.className).not.toContain('text-signal')
  })

  it.each([
    ['reduced motion', true],
    ['animated', false],
  ])('fences the decorative layers off from assistive tech (%s)', (_label, reduced) => {
    mockReducedMotion(reduced as boolean)
    const { container } = render(<ShutterText text="AD JEET" />)
    const hidden = container.querySelector('[aria-hidden="true"]')
    expect(hidden).toBeTruthy()
    // every painted glyph sits inside the hidden subtree
    expect(hidden!.querySelectorAll('.shutter-char').length).toBe(paintedGlyphs(container).length)
    // the readable copy sits outside it
    expect(container.querySelector('.sr-only')?.textContent).toBe('AD JEET')
    // role="text" must not come back: it is not in the ARIA spec.
    expect(container.querySelector('[role="text"]')).toBeNull()
  })
})
