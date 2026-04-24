import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
})
