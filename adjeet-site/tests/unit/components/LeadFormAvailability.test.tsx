import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { LeadForm } from '@/components/sections/LeadForm'

afterEach(() => { cleanup(); vi.unstubAllEnvs() })

describe('contact form availability', () => {
  it('offers working contact links before visitors fill an unusable production form', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    render(<LeadForm />)
    expect(screen.getByRole('heading', { name: 'Send your brief directly.' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'WhatsApp your brief' })).toHaveAttribute('href', expect.stringContaining('https://wa.me/919832011524'))
    expect(screen.getByRole('link', { name: 'Call +91 98320 11524' })).toHaveAttribute('href', 'tel:+919832011524')
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button', { name: /Send the brief/ })).toBeNull()
  })
})
