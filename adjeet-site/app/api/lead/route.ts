import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/lead-schema'
import getClientPromise from '@/lib/mongodb'
import { appendToSheet } from '@/lib/google-sheets'

// Fix 1: Add adjeet.in + www.adjeet.in to allowed origins
const ALLOWED_ORIGINS = [
  'https://adjeet.in',
  'https://www.adjeet.in',
  'https://adjeet.vercel.app',
  'https://www.adjeet.vercel.app',
  'http://localhost:3000',
]

// Fix 2: Upstash Redis rate limiter (replaces in-memory Map)
let ratelimit: { limit: (id: string) => Promise<{ success: boolean }> } | null = null

async function getRateLimiter() {
  if (ratelimit) return ratelimit

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Dev fallback: always allow
    console.warn('[lead] Upstash env vars missing — rate limiting disabled')
    return null
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: true,
      prefix: 'lead',
    })
    return ratelimit
  } catch (err) {
    console.error('[lead] Failed to initialize Upstash:', err)
    return null
  }
}

// Max request body size: 10KB (generous for a simple form)
const MAX_BODY_SIZE = 10_000

export const maxDuration = 10 // seconds (Vercel function timeout)

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 10)

  // Origin / CSRF check — require Origin header (browsers always send it on
  // cross-origin POST). Direct API hits from curl/scrapers are blocked.
  const origin = req.headers.get('origin')
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Request size limit
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  // Rate limiting via Upstash
  const limiter = await getRateLimiter()
  if (limiter) {
    const { success } = await limiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
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
    console.error(`[lead:${reqId}] Validation failed:`, parsed.error.issues)
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 422 })
  }

  const { _hp, name, phone, city, serviceInterest, timeline, message, cfTurnstileResponse } = parsed.data

  // Bot trap
  if (_hp) {
    return NextResponse.json({ ok: true }) // silently discard
  }

  // Turnstile Verification — fail closed in production if secret is missing.
  // Dev test key only used outside production to keep local dev frictionless.
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    ?? (process.env.NODE_ENV !== 'production' ? '1x0000000000000000000000000000000AA' : null);
  if (!turnstileSecret) {
    console.error(`[lead:${reqId}] TURNSTILE_SECRET_KEY missing in production — blocking submission`)
    return NextResponse.json({ error: 'Server configuration error. Please reach us on WhatsApp at +91 98320 11524.' }, { status: 503 })
  }
  try {
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(cfTurnstileResponse)}&remoteip=${encodeURIComponent(ip)}`,
    });
    
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      console.warn(`[lead:${reqId}] Turnstile verification failed:`, turnstileData);
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 });
    }
  } catch (err) {
    console.error(`[lead:${reqId}] Turnstile error:`, err);
    return NextResponse.json({ error: 'CAPTCHA service unavailable. Please try WhatsApp.' }, { status: 500 });
  }

  // 1. Save to MongoDB First (Fastest and most reliable)
  let dbInserted = false;
  try {
    const client = await getClientPromise();
    const db = client.db('adjeet');
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
    console.error(`[lead:${reqId}] MongoDB error:`, err);
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
    console.error(`[lead:${reqId}] Sheets error:`, err);
  }

  // 3. Send Email via Resend
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback: log with PII redacted
    console.log(`[lead:${reqId}]`, { name, phone: phone.slice(0, 4) + '****', city, serviceInterest, timeline })
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
      console.error(`[lead:${reqId}] Resend error`, error)
      // If DB also failed, return error to user. Otherwise return success.
      if (!dbInserted) {
        return NextResponse.json({ error: 'Failed to submit. Please try WhatsApp.' }, { status: 500 })
      }
    }
  } catch (err) {
    console.error(`[lead:${reqId}] Resend exception:`, err);
    if (!dbInserted) {
      return NextResponse.json({ error: 'Failed to submit. Please try WhatsApp.' }, { status: 500 })
    }
  }

  // 4. Feature 1: WhatsApp notification via Twilio (non-fatal)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioToken = process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM
  const rupamNumber = process.env.RUPAM_WHATSAPP_NUMBER

  if (twilioSid && twilioToken && twilioFrom && rupamNumber) {
    try {
      const { Twilio } = await import('twilio')
      const client = new Twilio(twilioSid, twilioToken)
      await client.messages.create({
        from: twilioFrom,
        to: rupamNumber,
        body: `New AD-JEET lead:\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nServices: ${serviceInterest.join(', ')}\nTimeline: ${timeline}${message ? `\nNote: ${message}` : ''}`,
      })
    } catch (err) {
      console.error(`[lead:${reqId}] Twilio WhatsApp error:`, err)
      // Non-fatal — lead is already saved
    }
  }

  return NextResponse.json({ ok: true })
}
