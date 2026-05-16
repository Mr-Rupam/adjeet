import { NextRequest, NextResponse } from 'next/server';
import ai from '@/lib/ai';
import { ADJEET_SYSTEM_PROMPT } from '@/lib/chatbot-prompt';

export const maxDuration = 30;

// Fix 4: Same ALLOWED_ORIGINS as lead route
const ALLOWED_ORIGINS = [
  'https://adjeet.in',
  'https://www.adjeet.in',
  'https://adjeet.vercel.app',
  'https://www.adjeet.vercel.app',
  'http://localhost:3000',
];

// Fix 4: Upstash Redis rate limiter (replaces in-memory Map)
let ratelimit: { limit: (id: string) => Promise<{ success: boolean }> } | null = null;

async function getRateLimiter() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[chatbot] Upstash env vars missing — rate limiting disabled');
    return null;
  }

  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');

    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'chatbot',
    });
    return ratelimit;
  } catch (err) {
    console.error('[chatbot] Failed to initialize Upstash:', err);
    return null;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const reqId = Math.random().toString(36).slice(2, 10)

  // CORS / origin check — require Origin header (browsers always send on POST).
  const origin = req.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // Fix 4: Upstash rate limiting
  const limiter = await getRateLimiter();
  if (limiter) {
    const { success } = await limiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'You have sent too many messages. Please try again later or contact us on WhatsApp at +91 98320 11524.' },
        { status: 429 }
      );
    }
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
  }

  // Limit conversation history to last 10 messages to control token usage
  const recentMessages = messages.slice(-10);

  // Validate message format. Cap BOTH roles: client controls the whole array,
  // so an attacker could otherwise smuggle 50KB+ "assistant" messages to bloat
  // input tokens, or forge prior assistant turns to jailbreak the system prompt.
  for (const msg of recentMessages) {
    if ((msg.role !== 'user' && msg.role !== 'assistant') ||
        typeof msg.content !== 'string' || msg.content.length === 0) {
      return NextResponse.json({ error: 'Invalid message format.' }, { status: 400 });
    }
    const cap = msg.role === 'user' ? 500 : 2000;
    if (msg.content.length > cap) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep your question under 500 characters.' },
        { status: 400 }
      );
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error(`[chatbot:${reqId}] OPENAI_API_KEY missing — chatbot disabled`)
    return NextResponse.json(
      { error: 'Chat is temporarily unavailable. Please reach us on WhatsApp at +91 98320 11524.' },
      { status: 503 }
    );
  }

  try {
    const response = await ai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ADJEET_SYSTEM_PROMPT },
        ...recentMessages,
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again or contact us on WhatsApp at +91 98320 11524.";

    return NextResponse.json({ content: reply });
  } catch (error: unknown) {
    console.error(`[chatbot:${reqId}] Error:`, error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or reach us on WhatsApp at +91 98320 11524.' },
      { status: 500 }
    );
  }
}
