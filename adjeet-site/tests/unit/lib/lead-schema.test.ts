import { describe, expect, it } from 'vitest'
import { leadSchema } from '@/lib/lead-schema'
const brief = { name: 'Buyer Name', phone: '9876543210', city: 'Siliguri', serviceInterest: ['glow-sign-boards'], timeline: 'exploring', cfTurnstileResponse: 'test' }
const name = (value: string) => leadSchema.safeParse({ ...brief, name: value })

describe('names', () => {
  it.each([
    'রূপম দাস',
    'रूपम दास',
    'José D’Souza',
    'S.K. Sharma',
    'Md. Rahim',
    // Bengali ya-phala is typed with a zero-width joiner (U+200D).
    'র‍্যাচেল দাস',
    // Some keyboards add a space after the last word.
    'Rupam Das ',
  ])('accepts a real name in its own script: %s', value => {
    expect(name(value).success).toBe(true)
  })

  it.each([
    ['blank', '  '],
    ['markup', '<script>alert(1)</script>'],
    ['too long', 'a'.repeat(51)],
    ['digits', 'Rupam 123'],
    ['a link', 'http://example.com'],
    ['line feed', 'Rupam\nDas'],
    ['carriage return', 'Rupam\rDas'],
    ['CRLF at the end', 'Rupam Das\r\n'],
    ['tab', 'Rupam\tDas'],
    ['NUL', 'Rupam\u0000'],
    ['bell', '\u0007Rupam'],
    ['line separator', 'Rupam Das'],
    ['a leading combining mark', '́́ Das'],
    ['joiners only', '‍‍'],
  ])('rejects %s', (_label, value) => {
    expect(name(value).success).toBe(false)
  })
})

describe('local enquiry qualification', () => {
  it('lets a buyer request help choosing without inventing urgency', () => {
    expect(leadSchema.safeParse({ ...brief, serviceInterest: ['help-choosing'], timeline: 'unspecified' }).success).toBe(true)
  })

  it('rejects an invalid retry reference', () => {
    expect(leadSchema.safeParse({ ...brief, submissionId: 'not-a-uuid' }).success).toBe(false)
  })
})
