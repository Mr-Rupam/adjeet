import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ServicesBoard } from '@/components/street/ServicesBoard'

describe('ServicesBoard', () => {
  it('renders one row per service', () => {
    render(<ServicesBoard />)
    const links = screen.getAllByRole('link')
    expect(links.filter(l => l.getAttribute('href')?.startsWith('/services/'))).toHaveLength(10)
  })

  it('each row href points to /services/[slug]', () => {
    render(<ServicesBoard />)
    const links = screen.getAllByRole('link').filter(l =>
      l.getAttribute('href')?.startsWith('/services/')
    )
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/services\/[\w-]+$/)
    })
  })

  it('shows the tagline and turnaround for each trade', () => {
    render(<ServicesBoard />)
    expect(screen.getByText('Illuminate your brand 24/7')).toBeTruthy()
    expect(screen.getAllByText('5–7 working days').length).toBeGreaterThan(0)
  })
})
