import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Lightbox } from '@/components/ui/Lightbox'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

const photos = [
  { src: '/a.jpg', alt: 'Photo A' },
  { src: '/b.jpg', alt: 'Photo B' },
  { src: '/c.jpg', alt: 'Photo C' },
]

// Mock next/image to a plain img
vi.mock('next/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ src, alt, ..._rest }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('Lightbox', () => {
  it('renders current photo alt text', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Lightbox photos={photos} initialIndex={0} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(<Lightbox photos={photos} initialIndex={0} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('navigates to next photo on ArrowRight', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByAltText('Photo B')).toBeTruthy()
  })

  it('navigates to previous photo on ArrowLeft', () => {
    render(<Lightbox photos={photos} initialIndex={1} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('wraps from last to first on ArrowRight', () => {
    render(<Lightbox photos={photos} initialIndex={2} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('has role="dialog" for accessibility', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('focuses the close button on open', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    const closeBtn = screen.getByRole('button', { name: /close/i })
    expect(document.activeElement).toBe(closeBtn)
  })

  it('locks body scroll on open and restores on unmount', () => {
    const { unmount } = render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('wraps from first to last on ArrowLeft', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Photo C')).toBeTruthy()
  })

  describe('Ask about a sign like this', () => {
    const referenced = [
      { src: '/a.jpg', alt: 'Photo A', reference: { id: 'acc-125', client: 'ACC', label: 'ACP & LED Signage, Dalkhola' } },
      { src: '/b.jpg', alt: 'Photo B', reference: { id: 'tanyamakeovers-154', client: 'Tanyamakeovers', label: 'ACP & LED Signage, Siliguri' } },
      { src: '/c.jpg', alt: 'Photo C' },
    ]
    const ask = () => screen.getByRole('link', { name: /ask about a sign like this/i })
    const text = () => new URL(ask().getAttribute('href')!).searchParams.get('text')

    it('sits under the caption and names the photo on screen', () => {
      render(<Lightbox photos={referenced} initialIndex={0} onClose={vi.fn()} />)
      expect(text()).toBe('Hi AD JEET, I am interested in a sign like this example: ACC, ACP & LED Signage, Dalkhola (acc-125). My shop is in ___. Can you help me choose?')
      expect(ask()).toHaveAttribute('target', '_blank')
      expect(ask()).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('follows next and previous', () => {
      render(<Lightbox photos={referenced} initialIndex={0} onClose={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))
      expect(text()).toContain('(tanyamakeovers-154)')
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      expect(text()).toContain('(acc-125)')
    })

    it('falls back to the general enquiry for a photo with no reference', () => {
      render(<Lightbox photos={referenced} initialIndex={2} onClose={vi.fn()} />)
      expect(ask()).toHaveAttribute('href', defaultWhatsAppUrl())
    })

    it('keeps keyboard focus inside the viewer, link included', () => {
      render(<Lightbox photos={referenced} initialIndex={0} onClose={vi.fn()} />)
      const close = screen.getByRole('button', { name: /close/i })
      expect(document.activeElement).toBe(close)
      // Shift+Tab from the first control wraps to the last one, which is the link.
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(ask())
      // Tab from the link wraps back to the close button.
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.activeElement).toBe(close)
    })
  })
})
