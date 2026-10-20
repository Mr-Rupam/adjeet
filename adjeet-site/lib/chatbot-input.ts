/**
 * What /api/chatbot accepts from the browser. The visitor's device holds the
 * conversation, so every field here is untrusted: the route keeps only the
 * two roles a visitor's chat can contain and builds each OpenAI message from
 * scratch, so nothing else the client sent reaches the model.
 */
export const CHAT_LIMITS = {
  /** How many of the latest messages the model sees. */
  messages: 8,
  /** Characters in one visitor message. */
  userChars: 500,
  /** Characters kept of an earlier reply the browser echoes back as context. */
  assistantChars: 2500,
  /** Entries in the array before any are dropped; a longer one is not a real chat. */
  entries: 100,
  /**
   * Bytes of request body. Eight messages at their limits can reach about
   * 30 KB in a script that takes three bytes a character, such as Bengali.
   */
  bodyBytes: 32_768,
} as const

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ParsedChat = { ok: true; messages: ChatMessage[] } | { ok: false; error: string }

const INVALID = { ok: false, error: 'Invalid message format.' } as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Turn a request body into the messages to send to the model, or say why not.
 * Entries with any role but user or assistant are dropped, never forwarded,
 * so a client cannot supply its own system prompt, tool call or function
 * result. The last message must be the visitor's.
 */
export function parseChatMessages(body: unknown): ParsedChat {
  const raw = isRecord(body) ? body.messages : undefined
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: 'Messages are required.' }
  if (raw.length > CHAT_LIMITS.entries) return INVALID

  const kept: ChatMessage[] = []
  for (const entry of raw) {
    if (!isRecord(entry)) continue
    const { role, content } = entry
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string' || content.trim().length === 0) return INVALID
    if (role === 'user' && content.length > CHAT_LIMITS.userChars) {
      return { ok: false, error: `Message is too long. Please keep your question under ${CHAT_LIMITS.userChars} characters.` }
    }
    kept.push({ role, content: role === 'assistant' ? content.slice(0, CHAT_LIMITS.assistantChars) : content })
  }

  const messages = kept.slice(-CHAT_LIMITS.messages)
  if (messages.at(-1)?.role !== 'user') return INVALID
  return { ok: true, messages }
}
