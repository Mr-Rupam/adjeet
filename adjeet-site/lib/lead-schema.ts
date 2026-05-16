import { z } from 'zod'
import { SERVICE_SLUGS } from '@/content/services'

export const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'one_month', label: 'Within a month' },
  { value: 'three_months', label: 'Within 3 months' },
  { value: 'exploring', label: 'Just exploring' },
] as const

export const COVERAGE_CITIES = [
  'Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda',
  'Alipurduar', 'Kalimpong', 'Other',
] as const

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .regex(/^[A-Za-z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
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
    .array(z.enum(SERVICE_SLUGS))
    .min(1, 'Please select at least one service so we can route your request'),

  timeline: z.enum(['immediate', 'one_month', 'three_months', 'exploring']),

  message: z
    .string()
    .max(1000, 'Message is too long (max 1000 characters)')
    .refine(
      (val) => !/(http|https):\/\/[^\s]+/.test(val ?? ''),
      'Please do not include links in your message'
    )
    .optional()
    .or(z.literal('')), // Allows empty strings when optional fails

  _hp: z.string().max(0, 'Bot detected').optional(),

  cfTurnstileResponse: z.string().min(1, 'Please complete the CAPTCHA'),
})

export type LeadInput = z.infer<typeof leadSchema>
