import { afterEach, describe, expect, it, vi } from 'vitest'
import { briefFingerprint, leadBrief, newSubmissionId } from '@/lib/lead-brief'
import { leadSchema } from '@/lib/lead-schema'

const lead = {
  name: ' Rupam Das ', phone: '+919876543210', city: 'Siliguri' as const,
  serviceInterest: ['flex-printing', 'glow-sign-boards', 'flex-printing'] as ('flex-printing' | 'glow-sign-boards')[],
  timeline: 'exploring' as const, message: ' Shopfront board ',
}

afterEach(() => { vi.unstubAllGlobals() })

describe('the brief shared by the form and the server', () => {
  it('normalises what the visitor typed, so a retry of the same brief compares equal', () => {
    expect(leadBrief(lead)).toEqual({
      name: 'Rupam Das', phone: '9876543210', city: 'Siliguri',
      serviceInterest: ['flex-printing', 'glow-sign-boards'], timeline: 'exploring', message: 'Shopfront board',
    })
    expect(briefFingerprint({ ...lead, phone: '9876543210', serviceInterest: ['glow-sign-boards', 'flex-printing'] }))
      .toBe(briefFingerprint(lead))
  })

  it('changes when the brief changes', () => {
    expect(briefFingerprint({ ...lead, message: 'Different' })).not.toBe(briefFingerprint(lead))
  })
})

describe('submission reference', () => {
  it('is a UUID the server accepts', () => {
    const id = newSubmissionId()
    expect(leadSchema.shape.submissionId.safeParse(id).success).toBe(true)
  })

  it('still works on browsers without crypto.randomUUID (Safari before 15.4)', () => {
    const { getRandomValues } = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: getRandomValues.bind(globalThis.crypto) })
    const ids = new Set(Array.from({ length: 50 }, newSubmissionId))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(leadSchema.shape.submissionId.safeParse(id).success).toBe(true)
  })
})
