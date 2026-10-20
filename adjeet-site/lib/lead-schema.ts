import { z } from '@/lib/zod'
import { SERVICE_SLUGS } from '@/content/services'

export const TIMELINE_OPTIONS = [
  { value: 'unspecified', label: 'No fixed date yet' },
  { value: 'immediate', label: 'Immediately' },
  { value: 'one_month', label: 'Within a month' },
  { value: 'three_months', label: 'Within 3 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const

/**
 * When the visitor would like to be called. A request, never a booking: the
 * site names no hours and promises no call time. The form leaves it unselected
 * and then sends nothing, so an absent value means the visitor chose nothing.
 */
export const CALL_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'any_time', label: 'Any time' },
] as const

export type CallTime = (typeof CALL_TIME_OPTIONS)[number]['value']

/** The words the owner reads in the Sheet and in notifications. */
export function callTimeLabel(value: CallTime): string {
  return CALL_TIME_OPTIONS.find(option => option.value === value)?.label ?? value
}

export const COVERAGE_CITIES = [
  'Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda',
  'Alipurduar', 'Kalimpong', 'Gangtok', 'Other',
] as const

/** For a buyer who knows the shop needs a sign but not which kind. Not a service page. */
export const HELP_CHOOSING = { slug: 'help-choosing', name: 'I need help choosing a sign' } as const

/**
 * Letters and combining marks in any script (Bengali, Devanagari, Latin and
 * so on), with spaces, dots, hyphens and apostrophes between them. The
 * zero-width joiner and non-joiner are allowed because Bengali keyboards type
 * them inside words (ya-phala). It must start with a letter, and it admits no
 * digits, markup, links or control characters: plain space is the only
 * whitespace, so CR, LF and tab cannot split the owner's notification text.
 */
const NAME = /^ *\p{L}[\p{L}\p{M}‌‍ .'’-]*$/u

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your name, at least 2 characters')
    .max(50, 'Please shorten your name to 50 characters or fewer')
    .regex(NAME, 'Please use letters, spaces, hyphens, or apostrophes in your name')
    .refine((val) => val.trim().length >= 2, 'Please enter your real name'),

  phone: z
    .string()
    // Strips out all spaces, dashes, and brackets before checking the regex
    .transform(val => val.replace(/[\s\-\(\)]/g, ''))
    .refine(
      (val) => /^(?:\+91|91)?[6-9]\d{9}$/.test(val),
      'Please enter a valid 10-digit Indian phone number (e.g. 9876543210 or +919876543210)'
    ),

  city: z.enum(COVERAGE_CITIES, { 
    message: 'Please select a valid city from the list'
  }),

  serviceInterest: z
    .array(z.enum([...SERVICE_SLUGS, HELP_CHOOSING.slug]))
    .max(SERVICE_SLUGS.length + 1)
    .min(1, 'Please select at least one service so we can route your request'),

  timeline: z.enum(['unspecified', 'immediate', 'one_month', 'three_months', 'exploring']),
  bestTimeToCall: z.enum(['morning', 'afternoon', 'evening', 'any_time']).optional(),
  submissionId: z.string().uuid().optional(),
  source: z.unknown().optional(),

  message: z
    .string()
    .max(1000, 'Please shorten your message to 1000 characters or fewer')
    .refine(
      (val) => !/(http|https):\/\/[^\s]+/.test(val ?? ''),
      'Please remove any links from your message, then send again'
    )
    .optional()
    .or(z.literal('')), // Allows empty strings when optional fails

  _hp: z.string().max(0, 'Bot detected').optional(),

  cfTurnstileResponse: z.string().min(1, 'Please complete the CAPTCHA above so we know you are human').max(2048),
})

export type LeadInput = z.infer<typeof leadSchema>
