import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl, defaultWhatsAppUrl, projectEnquiryMessage, projectWhatsAppUrl } from '@/lib/whatsapp'

describe('buildWhatsAppUrl', () => {
  it('produces a wa.me URL with the given phone number', () => {
    const url = buildWhatsAppUrl('+919876543210', '')
    expect(url).toBe('https://wa.me/919876543210')
  })

  it('URL-encodes the message', () => {
    const url = buildWhatsAppUrl('+919876543210', 'Hello World')
    expect(url).toContain('text=Hello%20World')
  })

  it('strips leading + from phone number', () => {
    const url = buildWhatsAppUrl('+911234567890', '')
    expect(url.startsWith('https://wa.me/91')).toBe(true)
  })

  it('omits text param when message is empty', () => {
    const url = buildWhatsAppUrl('+919876543210', '')
    expect(url).not.toContain('text=')
  })
})

describe('defaultWhatsAppUrl', () => {
  /** The message the buyer actually sees, decoded back out of the URL. */
  function message(url: string) {
    const text = new URL(url).searchParams.get('text')
    return text ?? ''
  }

  // Regression guard: the message was assembled by joining parts on a space
  // with '. Please get in touch.' as one of them, so it read
  // "…on your website . Please get in touch." A broken sentence, on the
  // most important string on the site.
  it.each([
    [undefined],
    [{ service: 'Glow Sign Boards' }],
    [{ city: 'Siliguri' }],
    [{ service: 'Glow Sign Boards', city: 'Siliguri' }],
  ])('never strands punctuation (%o)', ctx => {
    const text = message(defaultWhatsAppUrl(ctx))
    expect(text).not.toMatch(/\s[.,!?]/)
    expect(text).not.toMatch(/\s{2,}/)
    expect(text.trim()).toBe(text)
  })

  it('names the trade and the town when both are known', () => {
    const text = message(defaultWhatsAppUrl({ service: 'Glow Sign Boards', city: 'Siliguri' }))
    expect(text).toContain('Glow Sign Boards')
    expect(text).toContain('Siliguri')
  })

  it('still reads as a whole sentence with no context', () => {
    const text = message(defaultWhatsAppUrl())
    expect(text).toBe('Hi AD JEET, I found you on your website. Could you send me a quote?')
  })

  it('always asks for the quote', () => {
    for (const ctx of [undefined, { service: 'Flex Printing' }, { city: 'Malda' }]) {
      expect(message(defaultWhatsAppUrl(ctx))).toContain('quote')
    }
  })

  it('ignores blank context rather than emitting an empty clause', () => {
    const text = message(defaultWhatsAppUrl({ service: '  ', city: '' }))
    expect(text).toBe('Hi AD JEET, I found you on your website. Could you send me a quote?')
  })
})

describe('projectWhatsAppUrl', () => {
  function message(url: string) {
    return new URL(url).searchParams.get('text') ?? ''
  }
  const tanya = { id: 'tanyamakeovers-154', client: 'Tanyamakeovers', label: 'Lit studio lettering, Siliguri' }

  it('names the example the buyer was looking at, by its public reference', () => {
    expect(projectEnquiryMessage(tanya)).toBe(
      'Hi AD JEET, I am interested in a sign like this example: Tanyamakeovers, Lit studio lettering, Siliguri (tanyamakeovers-154). My shop is in ___. Can you help me choose?',
    )
    expect(message(projectWhatsAppUrl(tanya))).toBe(projectEnquiryMessage(tanya))
  })

  it('encodes the message so the reference survives the URL', () => {
    const url = projectWhatsAppUrl({ id: 'acc-125', client: 'ACC', label: 'ACP & LED Signage, Dalkhola' })
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    expect(url).not.toContain(' ')
    expect(url).toContain(encodeURIComponent('ACP & LED Signage'))
    expect(message(url)).toContain('(acc-125)')
  })

  it('falls back to the general enquiry without a reference', () => {
    for (const reference of [undefined, null, { id: '  ', client: 'ACC', label: '' }]) {
      expect(projectWhatsAppUrl(reference)).toBe(defaultWhatsAppUrl())
    }
  })

  it('never strands punctuation when the label is empty', () => {
    const text = projectEnquiryMessage({ id: 'x-1', client: 'ACC', label: '' })
    expect(text).toContain('example: ACC (x-1).')
    expect(text).not.toMatch(/\s[.,!?]/)
    expect(text).not.toMatch(/,\s*\(/)
  })
})
