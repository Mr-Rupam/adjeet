import { NextRequest, NextResponse } from 'next/server'
import ai from '@/lib/ai'
import { business } from '@/lib/business'
import { ADJEET_SYSTEM_PROMPT } from '@/lib/chatbot-prompt'
import { CHAT_LIMITS, parseChatMessages } from '@/lib/chatbot-input'
import { CHATBOT_DEADLINES, checkChatAllowance } from '@/lib/chatbot-guard'
import { clientIp, rateKey } from '@/lib/client-ip'
import { allowedOrigins } from '@/lib/allowed-origins'
import { bounded } from '@/lib/lead-deadline'
import { BodyTooLarge, readJsonBody } from '@/lib/request-body'

export const maxDuration = 30

const ALLOWED_ORIGINS = allowedOrigins()

/** The OpenAI model unless CHATBOT_MODEL names another. */
const DEFAULT_MODEL = 'gpt-3.5-turbo'

// Every refusal points at WhatsApp, which needs none of this machinery.
const WHATSAPP = `Please reach us on WhatsApp at ${business.phoneDisplay}.`
const UNAVAILABLE = `Chat is not available right now. ${WHATSAPP}`

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 10)

  // A browser sets Origin itself, so a page on another site cannot post here.
  // A script can send any Origin it likes: the limits below are the real
  // control, and they decline the chat whenever they cannot be applied.
  const origin = req.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (Number(req.headers.get('content-length')) > CHAT_LIMITS.bodyBytes) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  }

  let body: unknown
  try {
    body = await readJsonBody(req, CHAT_LIMITS.bodyBytes, CHATBOT_DEADLINES.body)
  } catch (error) {
    return error instanceof BodyTooLarge
      ? NextResponse.json({ error: 'Request too large.' }, { status: 413 })
      : NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = parseChatMessages(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  // Server kill switch: CHATBOT_ENABLED=false answers every chat with the
  // WhatsApp fallback, spending nothing on OpenAI or the limiter.
  if (process.env.CHATBOT_ENABLED?.trim().toLowerCase() === 'false') {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error(`[chatbot:${reqId}] OPENAI_API_KEY missing, chatbot disabled`)
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
  }

  // With no address to count the visitor under, the chat is declined.
  const visitor = rateKey(clientIp(req.headers) ?? '')
  const allowance = visitor ? await checkChatAllowance(visitor) : 'unavailable'
  if (allowance === 'visitor-limit') {
    return NextResponse.json({ error: `You have sent too many messages. Please try again later. ${WHATSAPP}` }, { status: 429 })
  }
  if (allowance === 'daily-budget') {
    return NextResponse.json({ error: `Chat has reached its limit for today. ${WHATSAPP}` }, { status: 503 })
  }
  if (allowance !== 'allowed') {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
  }

  try {
    const response = await bounded(signal => ai.chat.completions.create({
      model: process.env.CHATBOT_MODEL?.trim() || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: ADJEET_SYSTEM_PROMPT },
        ...parsed.messages,
      ],
      temperature: 0.5,
      max_tokens: 500,
      // No automatic retries: each one is another paid call.
    }, { signal, maxRetries: 0, timeout: CHATBOT_DEADLINES.openai }), CHATBOT_DEADLINES.openai)

    const reply = response.choices[0]?.message?.content || `I'm sorry, I couldn't process that. ${WHATSAPP}`

    return NextResponse.json({ content: reply });
  } catch (error: unknown) {
    const kind = error instanceof Error && error.name !== 'Error' ? error.name : 'error'
    console.error(`[chatbot:${reqId}] OpenAI call failed: ${kind}`)
    return NextResponse.json(
      { error: `Something went wrong. Please try again or reach us on WhatsApp at ${business.phoneDisplay}.` },
      { status: 500 }
    );
  }
}
