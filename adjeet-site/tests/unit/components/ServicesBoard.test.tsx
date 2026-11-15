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

  it('shows the tagline and the approved job time for each trade', () => {
    render(<ServicesBoard />)
    expect(screen.getByText('Lit name boards for shops, clinics and dealer outlets')).toBeTruthy()
    expect(screen.getAllByText('1 to 3 days from the order').length).toBe(3)
    expect(screen.getByText('2 to 5 days from the order')).toBeTruthy()
    expect(screen.getByText('3 to 5 days from the order')).toBeTruthy()
  })

  it('names the services that have no page yet, each with a WhatsApp action', () => {
    render(<ServicesBoard />)
    for (const name of ['Hoardings and billboards', 'Exhibitions and dealer meets', 'Activations and road shows']) {
      const link = screen.getByText(name).closest('a')
      expect(link?.getAttribute('href'), name).toMatch(/^https:\/\/wa\.me\//)
    }
  })
})
