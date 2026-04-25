import { z } from 'zod'

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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Enter a valid phone number'),
  city: z.string().min(1, 'Please select a city'),
  serviceInterest: z.array(z.string()).min(1, 'Select at least one service'),
  timeline: z.enum(['immediate', 'one_month', 'three_months', 'exploring']),
  message: z.string().max(1000).optional(),
  _hp: z.string().max(0, 'Bot detected').optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
