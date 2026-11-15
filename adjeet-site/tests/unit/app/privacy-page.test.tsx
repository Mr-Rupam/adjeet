import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import PrivacyPage, { metadata } from '@/app/(marketing)/privacy/page'
import { business } from '@/lib/business'

afterEach(cleanup)

function pageText() {
  const { container } = render(<PrivacyPage />)
  return container.textContent ?? ''
}

// Every statement on the page must be true of the code (security findings N6
// and section 10, 15 November 2026).
describe('privacy policy', () => {
  it('stays out of search results', () => {
    expect(metadata.robots).toMatchObject({ index: false })
  })

  it('names every field the enquiry form stores', () => {
    const text = pageText()
    for (const field of ['name', 'phone number', 'city', 'services', 'timeline', 'message', 'best time to call', 'landing page', 'campaign']) {
      expect(text.toLowerCase(), field).toContain(field)
    }
  })

  it('names every service that receives personal data', () => {
    const text = pageText()
    for (const processor of [
      'MongoDB Atlas', 'Google Sheets', 'Resend', 'Twilio', 'OpenAI', 'Cloudflare Turnstile', 'Upstash',
      'Google Analytics', 'Vercel Web Analytics', 'Vercel Speed Insights',
    ]) {
      expect(text, processor).toContain(processor)
    }
  })

  it('says chat text goes to an AI provider and asks visitors not to type personal details there', () => {
    const text = pageText()
    expect(text).toMatch(/chat[^.]*OpenAI/i)
    expect(text).toMatch(/do not (type|enter|share)[^.]*personal/i)
  })

  it('makes no retention promise the code does not keep', () => {
    const text = pageText()
    expect(text).not.toMatch(/12 months|twelve months/i)
    expect(text).toMatch(/delete[^.]*request/i)
  })

  it('gives every way to ask for a copy or deletion', () => {
    const text = pageText()
    expect(text).toContain(business.email)
    expect(text).toContain(business.phoneDisplay)
    expect(text).toMatch(/WhatsApp/)
    expect(text).toContain(business.office)
  })

  it('is dated 15 November 2026', () => {
    expect(pageText()).toContain('Last updated: 15 November 2026')
  })

  it('uses no em dashes', () => {
    expect(pageText()).not.toContain(String.fromCharCode(0x2014))
  })
})
