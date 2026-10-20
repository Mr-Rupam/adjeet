import type { LeadInput } from '@/lib/lead-schema'

type BriefFields = Pick<LeadInput, 'name' | 'phone' | 'city' | 'serviceInterest' | 'timeline' | 'message'>

/**
 * The visitor's brief, normalised. The form uses it to decide whether a retry
 * is the same enquiry (same reference) and the server uses it for the replay
 * check and the stored record, so the two can never disagree. A new form
 * field goes here once, then into the Sheet row and notification text in
 * app/api/lead/route.ts.
 */
export function leadBrief(lead: BriefFields) {
  return {
    name: lead.name.trim(),
    phone: lead.phone.replace(/^(?:\+91|91)(?=\d{10}$)/, ''),
    city: lead.city,
    serviceInterest: [...new Set(lead.serviceInterest)].sort(),
    timeline: lead.timeline,
    message: lead.message?.trim() ?? '',
  }
}
export type LeadBrief = ReturnType<typeof leadBrief>

/** Equal for the same brief, whatever the CAPTCHA token or attempt. */
export function briefFingerprint(lead: BriefFields): string {
  return JSON.stringify(leadBrief(lead))
}

/**
 * A random v4 UUID for one enquiry. `crypto.randomUUID` is missing before
 * Safari 15.4, and a throw here would leave the form unable to send at all,
 * so fall back to `getRandomValues`, which every supported browser has.
 */
export function newSubmissionId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
