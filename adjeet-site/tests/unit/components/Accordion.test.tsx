import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Mock framer-motion so AnimatePresence renders/removes children synchronously in jsdom
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ children, ...props }: any) =>
          React.createElement(tag, props, children),
    }
  ),
}))

import { Accordion } from '@/components/ui/Accordion'

const items = [
  { q: 'First question?', a: 'First answer.' },
  { q: 'Second question?', a: 'Second answer.' },
]

describe('Accordion', () => {
  it('renders all questions', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('First question?')).toBeTruthy()
    expect(screen.getByText('Second question?')).toBeTruthy()
  })

  it('answers are hidden by default', () => {
    render(<Accordion items={items} />)
    expect(screen.queryByText('First answer.')).toBeNull()
  })

  it('shows answer on click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.getByText('First answer.')).toBeTruthy()
  })

  it('collapses open item on second click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.queryByText('First answer.')).toBeNull()
  })

  it('only one item open at a time', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    fireEvent.click(screen.getByText('Second question?'))
    expect(screen.queryByText('First answer.')).toBeNull()
    expect(screen.getByText('Second answer.')).toBeTruthy()
  })

  it('sets aria-expanded correctly', () => {
    render(<Accordion items={items} />)
    const btn = screen.getAllByRole('button')[0]
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })
})
