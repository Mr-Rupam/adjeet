import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Accordion } from '@/components/ui/Accordion'

const items = [{ q: 'First question?', a: 'First answer.' }, { q: 'Second question?', a: 'Second answer.' }]

describe('Accordion', () => {
  it('keeps every question and answer in the DOM', () => {
    render(<Accordion items={items} />)
    for (const item of items) {
      expect(screen.getByText(item.q)).toBeVisible()
      expect(screen.getByText(item.a)).toBeInTheDocument()
    }
  })
  it('starts closed and opens through the native disclosure control', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('First answer.')).not.toBeVisible()
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.getByText('First answer.')).toBeVisible()
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.getByText('First answer.')).not.toBeVisible()
  })
  it('gives each accordion its own native disclosure group', () => {
    const { container } = render(<><Accordion items={items} /><Accordion items={[{ q: 'Another question?', a: 'Another answer.' }]} /></>)
    const details = container.querySelectorAll('details')
    expect(details[0].getAttribute('name')).toBe(details[1].getAttribute('name'))
    expect(details[0].getAttribute('name')).not.toBe(details[2].getAttribute('name'))
  })
})
