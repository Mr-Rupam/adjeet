import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

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
