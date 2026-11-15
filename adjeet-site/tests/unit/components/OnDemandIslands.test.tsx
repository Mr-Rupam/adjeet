import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ContactMap } from '@/components/contact/ContactMap'
import { Chatbot } from '@/components/Chatbot'
import { DeferredLeadForm } from '@/components/areas/DeferredLeadForm'

vi.mock('@/components/sections/LeadForm', () => ({
  LeadForm: ({ defaultCity, defaultService }: { defaultCity?: string; defaultService?: string }) => (
    <form data-testid="lead-form" data-default-city={defaultCity ?? ''} data-default-service={defaultService ?? ''} />
  ),
}))

afterEach(() => vi.unstubAllGlobals())

describe('ContactMap', () => {
  const props = {
    embedUrl: 'https://maps.google.com/maps?cid=1&output=embed',
    mapsUrl: 'https://maps.google.com/?cid=1',
    title: 'Workshop on Google Maps',
    address: 'AD JEET workshop, Patiram Jote, Siliguri 734010',
  }

  it('asks Google for nothing until the visitor wants the map', () => {
    render(<ContactMap {...props} />)
    expect(document.querySelector('iframe')).toBeNull()
    expect(screen.getByText(props.address)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open in google maps/i })).toHaveAttribute('href', props.mapsUrl)

    fireEvent.click(screen.getByRole('button', { name: 'Show map' }))
    const frame = screen.getByTitle(props.title)
    expect(frame).toHaveAttribute('src', props.embedUrl)
    expect(frame).toHaveFocus()
  })
})

describe('Chatbot', () => {
  it('ships only the bubble until it is opened, then shows the panel with its AI notice', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
    Element.prototype.scrollIntoView = vi.fn()
    render(<Chatbot />)
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Open AD JEET chat assistant' }))
    expect(await screen.findByText('This chat is answered by an AI assistant. Please do not share personal details here.', {}, { timeout: 3000 }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close chat', expanded: true })).toBeInTheDocument()
  })
})

describe('DeferredLeadForm', () => {
  it('holds a link to /contact for the town until the form is near, then passes the prefill through', async () => {
    const observers: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = []
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) { observers.push(callback) }
      observe() {}
      disconnect() {}
    })
    render(<DeferredLeadForm defaultCity="Cooch Behar" defaultService="glow-sign-boards" />)
    expect(screen.queryByTestId('lead-form')).toBeNull()
    expect(screen.getByRole('link', { name: /open the enquiry form/i })).toHaveAttribute('href', '/contact?city=Cooch%20Behar')

    act(() => observers.forEach(callback => callback([{ isIntersecting: true }])))
    const form = await screen.findByTestId('lead-form', {}, { timeout: 3000 })
    expect(form).toHaveAttribute('data-default-city', 'Cooch Behar')
    expect(form).toHaveAttribute('data-default-service', 'glow-sign-boards')
  })
})
