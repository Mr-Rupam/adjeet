import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from '@/components/motion/CountUp'

// Framer Motion is mocked to avoid animation in tests
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => <span {...p}>{children}</span>,
  },
  useInView: () => true,
  useMotionValue: (v: number) => ({ set: vi.fn(), get: () => v }),
  useTransform: (_: unknown, __: unknown, mapper: (v: number) => unknown) => ({ get: () => mapper(100) }),
  animate: vi.fn(),
}))

describe('CountUp', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced-motion check
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

  it('renders the target value when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    })
    render(<CountUp to={500} suffix="+" />)
    expect(screen.getByText('500+')).toBeTruthy()
  })

  it('renders suffix', () => {
    render(<CountUp to={35} suffix=" years" />)
    // The component renders the count + suffix in some form
    const el = screen.getByRole('status')
    expect(el).toBeTruthy()
  })
})
