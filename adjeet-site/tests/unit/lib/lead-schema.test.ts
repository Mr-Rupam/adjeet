import { describe, expect, it } from 'vitest'
import { CALL_TIME_OPTIONS, callTimeLabel, leadSchema } from '@/lib/lead-schema'
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

describe('best time to call', () => {
  const call = (value: unknown) => leadSchema.safeParse({ ...brief, bestTimeToCall: value })

  it.each(['morning', 'afternoon', 'evening', 'any_time'])('accepts %s', value => {
    const result = call(value)
    expect(result.success).toBe(true)
    expect(result.data?.bestTimeToCall).toBe(value)
  })

  it('is optional: an enquiry without it is still valid and carries no value', () => {
    const result = leadSchema.safeParse(brief)
    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('bestTimeToCall')
  })

  it.each([
    ['an empty string, which the form never sends', ''],
    ['a time of day that is not offered', 'night'],
    ['a different case', 'Morning'],
    ['an hour', '9am'],
    ['a number', 9],
    ['null', null],
    ['an array', ['morning']],
  ])('rejects %s', (_label, value) => {
    expect(call(value).success).toBe(false)
  })

  it('offers exactly the choices the schema accepts, with labels that name no hours', () => {
    expect(CALL_TIME_OPTIONS.map(option => option.value)).toEqual(['morning', 'afternoon', 'evening', 'any_time'])
    expect(CALL_TIME_OPTIONS.map(option => option.label)).toEqual(['Morning', 'Afternoon', 'Evening', 'Any time'])
    for (const { value } of CALL_TIME_OPTIONS) expect(call(value).success).toBe(true)
    expect(callTimeLabel('any_time')).toBe('Any time')
  })
})
