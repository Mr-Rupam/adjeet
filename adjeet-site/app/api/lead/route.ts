import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/lead-schema'

// Simple in-memory rate limit: 5 requests per IP per hour
// Replace with Vercel KV in production
const rateStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const entry = rateStore.get(ip)
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + window })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', issues: parsed.error.issues }, { status: 422 })
  }

  const { _hp, name, phone, city, serviceInterest, timeline, message } = parsed.data

  // Bot trap
  if (_hp) {
    return NextResponse.json({ ok: true }) // silently discard
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback: log and return success
    console.log('[lead]', { name, phone, city, serviceInterest, timeline, message })
    return NextResponse.json({ ok: true })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: 'leads@adjeet.in',
    to: 'info@adjeet.in',
    subject: `New lead from ${name} — ${city}`,
    text: [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `City: ${city}`,
      `Services: ${serviceInterest.join(', ')}`,
      `Timeline: ${timeline}`,
      `Message: ${message ?? '(none)'}`,
    ].join('\n'),
  })

  if (error) {
    console.error('[lead] Resend error', error)
    return NextResponse.json({ error: 'Failed to send. Please try WhatsApp.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
