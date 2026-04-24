import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy()
  })

  it('fires onClick', () => {
    const fn = vi.fn()
    render(<Button onClick={fn}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('renders as anchor when href provided', () => {
    render(<Button href="/contact">Contact</Button>)
    const link = screen.getByRole('link', { name: 'Contact' })
    expect(link.getAttribute('href')).toBe('/contact')
  })

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('is disabled when disabled prop passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
