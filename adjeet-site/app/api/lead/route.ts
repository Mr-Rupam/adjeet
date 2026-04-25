import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/lead-schema'
import getClientPromise from '@/lib/mongodb'
import { appendToSheet } from '@/lib/google-sheets'

// Allowed origins for CORS / CSRF protection
const ALLOWED_ORIGINS = [
  'https://adjeet.vercel.app',
  'https://www.adjeet.vercel.app',
  'http://localhost:3000',
]

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

// Max request body size: 10KB (generous for a simple form)
const MAX_BODY_SIZE = 10_000

export const maxDuration = 10 // seconds (Vercel function timeout)

export async function POST(req: NextRequest) {
  // Origin / CSRF check
  const origin = req.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Request size limit
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

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
    // Log details server-side, return generic error to client
    console.error('[lead] Validation failed:', parsed.error.issues)
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 422 })
  }

  const { _hp, name, phone, city, serviceInterest, timeline, message } = parsed.data

  // Bot trap
  if (_hp) {
    return NextResponse.json({ ok: true }) // silently discard
  }

  // 1. Save to MongoDB First (Fastest and most reliable)
  let dbInserted = false;
  try {
    const client = await getClientPromise();
    const db = client.db('adjeet'); // You can change the DB name
    const collection = db.collection('leads');
    await collection.insertOne({
      name,
      phone,
      city,
      serviceInterest,
      timeline,
      message,
      createdAt: new Date(),
    });
    dbInserted = true;
  } catch (err) {
    console.error('[lead] MongoDB error:', err);
    // If DB fails, we will still try to send email as fallback
  }

  // 2. Append to Google Sheets
  try {
    const sheetData = {
      Date: new Date().toISOString(),
      Name: name,
      Phone: phone,
      City: city,
      Services: serviceInterest.join(', '),
      Timeline: timeline,
      Message: message ?? '',
    };
    await appendToSheet(sheetData);
  } catch (err) {
    console.error('[lead] Sheets error:', err);
  }

  // 3. Send Email via Resend
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback: log with PII redacted
    console.log('[lead]', { name, phone: phone.slice(0, 4) + '****', city, serviceInterest, timeline })
    return NextResponse.json({ ok: true })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ranjitadjeet@gmail.com',
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
      // If DB also failed, return error to user. Otherwise return success.
      if (!dbInserted) {
        return NextResponse.json({ error: 'Failed to submit. Please try WhatsApp.' }, { status: 500 })
      }
    }
  } catch (err) {
    console.error('[lead] Resend exception:', err);
    if (!dbInserted) {
      return NextResponse.json({ error: 'Failed to submit. Please try WhatsApp.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
