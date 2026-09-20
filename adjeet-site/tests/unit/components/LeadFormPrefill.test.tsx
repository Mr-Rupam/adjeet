import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LeadForm } from '@/components/sections/LeadForm'

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

describe('contact form prefill', () => {
  // A regional page already knows the town and the trade, so asking again
  // wastes what the page just proved. `/contact` renders the same form with
  // neither prop and must still open empty.
  it('seeds the city and trade when the page knows them, and leaves them blank when it does not', () => {
    const { unmount } = render(<LeadForm defaultCity="Darjeeling" defaultService="glow-sign-boards" />)
    expect(screen.getByLabelText('City *')).toHaveValue('Darjeeling')
    expect(screen.getByRole('checkbox', { name: 'Glow Sign Boards' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Flex Printing' })).not.toBeChecked()
    unmount()

    const plain = render(<LeadForm />)
    expect(screen.getByLabelText('City *')).toHaveValue('')
    for (const box of screen.getAllByRole('checkbox')) expect(box).not.toBeChecked()
    plain.unmount()

    // A page that knows its own city outranks the query string. Regional pages
    // are served statically for any query string, so without the guard
    // `/glow-sign-board-in-siliguri?city=Malda` would show an H1 reading
    // Siliguri, copy claiming the city is filled in, and a select reading
    // Malda: a valid enum value, so it submits as a silently wrong lead.
    window.history.replaceState({}, '', '/glow-sign-board-in-siliguri?city=Malda')
    const { unmount: unmountRegional } = render(<LeadForm defaultCity="Siliguri" defaultService="glow-sign-boards" />)
    expect(screen.getByLabelText('City *')).toHaveValue('Siliguri')
    unmountRegional()

    // The coverage map still hands /contact a city this way, and there the
    // query string is the only thing that knows where the visitor is.
    render(<LeadForm />)
    expect(screen.getByLabelText('City *')).toHaveValue('Malda')
    // Four full renders of a form that mounts the CAPTCHA widget. Fast on its
    // own, but past the 5s default when the whole suite runs in parallel.
  }, 30000)
})
