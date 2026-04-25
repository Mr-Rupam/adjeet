import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Lightbox } from '@/components/ui/Lightbox'

const photos = [
  { src: '/a.jpg', alt: 'Photo A' },
  { src: '/b.jpg', alt: 'Photo B' },
  { src: '/c.jpg', alt: 'Photo C' },
]

// Mock next/image to a plain img
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) => (
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
})
