import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServicesGrid } from '@/components/sections/ServicesGrid'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) =>
      <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  animate: vi.fn(),
}))

beforeEach(() => {
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

describe('ServicesGrid', () => {
  it('renders 10 service tiles', () => {
    render(<ServicesGrid />)
    const links = screen.getAllByRole('link')
    expect(links.filter(l => l.getAttribute('href')?.startsWith('/services/'))).toHaveLength(10)
  })

  it('each tile href points to /services/[slug]', () => {
    render(<ServicesGrid />)
    const links = screen.getAllByRole('link').filter(l =>
      l.getAttribute('href')?.startsWith('/services/')
    )
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/services\/[\w-]+$/)
    })
  })

  it('does not show taglines by default (expanded=false)', () => {
    render(<ServicesGrid />)
    expect(screen.queryByText('Illuminate your brand 24/7')).toBeNull()
  })

  it('shows taglines when expanded=true', () => {
    render(<ServicesGrid expanded />)
    expect(screen.getByText('Illuminate your brand 24/7')).toBeTruthy()
  })
})
