import { NextRequest, NextResponse } from 'next/server';
import ai from '@/lib/ai';
import { ADJEET_SYSTEM_PROMPT } from '@/lib/chatbot-prompt';

export const maxDuration = 30;

// Rate limit: 20 messages per IP per hour
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'You have sent too many messages. Please try again later or contact us on WhatsApp at +91 98320 11524.' },
      { status: 429 }
    );
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

  // Validate message format
  for (const msg of recentMessages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      return NextResponse.json({ error: 'Invalid message format.' }, { status: 400 });
    }
    // Only limit length on user messages — assistant replies can be longer
    if (msg.role === 'user' && msg.content.length > 500) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep your question under 500 characters.' },
        { status: 400 }
      );
    }
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
    console.error('[api/chatbot] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or reach us on WhatsApp at +91 98320 11524.' },
      { status: 500 }
    );
  }
}
