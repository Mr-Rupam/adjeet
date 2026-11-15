'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent, type RefObject } from 'react'
import { ADJEET_GREETING } from '@/lib/chatbot-prompt'
import { CHAT_LIMITS } from '@/lib/chatbot-input'
import { Hammer, UserRound } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'What services do you offer?',
  'Coverage areas?',
  'How to get a quote?',
  'Turnaround time?',
]

/** Parse basic **bold** markdown into JSX */
function formatContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    // Handle line breaks and bullet points
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ))
  })
}

/**
 * The open chat window. Its code loads only when a visitor first reaches for
 * the bubble (see Chatbot.tsx), so the page never pays for it up front.
 */
export function ChatPanel({ isOpen, onClose, triggerRef }: {
  isOpen: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', role: 'assistant', content: ADJEET_GREETING },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  // The panel mounts closed for a frame so its opening transition still plays.
  const [entered, setEntered] = useState(false)
  const shown = isOpen && entered

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const msgIdRef = useRef(0)

  useEffect(() => {
    let second = 0
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      window.cancelAnimationFrame(first)
      window.cancelAnimationFrame(second)
    }
  }, [])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Keep the non-modal assistant keyboard-accessible without trapping the page.
  useEffect(() => {
    if (!shown) return
    const trigger = triggerRef.current
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      trigger?.focus()
    }
  }, [shown, onClose, triggerRef])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: `user-${++msgIdRef.current}`,
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setHasInteracted(true)

    // Build messages array for API (exclude greeting). The server reads only
    // the latest few, so a long chat does not send what it would discard.
    const apiMessages = [...messages, userMsg]
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({ role: m.role, content: m.content }))
      .slice(-CHAT_LIMITS.messages)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${++msgIdRef.current}`,
            role: 'assistant',
            content: data.error || 'Something went wrong. Please try again or contact us on WhatsApp at +91 98320 11524.',
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${++msgIdRef.current}`,
            role: 'assistant',
            content: data.content,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or reach us on WhatsApp at +91 98320 11524.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleSuggestion = (text: string) => {
    sendMessage(text)
  }

  return (
    <div
      className="chatbot-window"
      data-visible={shown}
      role="dialog"
      aria-label="AD JEET Chat Assistant"
      data-clarity-mask="true"
      aria-hidden={!shown}
      inert={!shown}
    >
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header__avatar"><Hammer size={19} aria-hidden="true" /></div>
        <div className="chatbot-header__info">
          <div className="chatbot-header__name">JEET, AD JEET Assistant</div>
          <div className="chatbot-header__status">AI assistant</div>
        </div>
        <button
          className="chatbot-header__close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p className="chatbot-notice">This chat is answered by an AI assistant. Please do not share personal details here.</p>

      {/* Messages */}
      <div className="chatbot-messages" role="log" aria-label="Conversation" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role === 'assistant' ? 'bot' : 'user'}`}>
            <div className="chatbot-msg__avatar">
              {msg.role === 'assistant' ? <Hammer size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}
            </div>
            <div className="chatbot-msg__content">
              {formatContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="chatbot-msg chatbot-msg--bot">
            <div className="chatbot-msg__avatar"><Hammer size={15} aria-hidden="true" /></div>
            <div className="chatbot-msg__content">
              <div className="chatbot-typing" role="status" aria-label="Assistant is replying">
                <div className="chatbot-typing__dot" />
                <div className="chatbot-typing__dot" />
                <div className="chatbot-typing__dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only before first user interaction) */}
      {!hasInteracted && (
        <div className="chatbot-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="chatbot-suggestion-btn"
              onClick={() => handleSuggestion(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="chatbot-input-area" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          className="chatbot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about our services..."
          rows={1}
          maxLength={500}
          disabled={isLoading}
          aria-label="Type your message"
        />
        <button
          className="chatbot-send-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {/* Footer */}
      <div className="chatbot-footer">
        For urgent queries, <a href="tel:+919832011524" className="underline">call +91 98320 11524</a>
      </div>
    </div>
  )
}
