'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { ADJEET_GREETING } from '@/lib/chatbot-prompt'
import './Chatbot.css'

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

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', role: 'assistant', content: ADJEET_GREETING },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBadge, setShowBadge] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen((prev) => !prev)
    setShowBadge(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setHasInteracted(true)

    // Build messages array for API (exclude greeting)
    const apiMessages = [...messages, userMsg]
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({ role: m.role, content: m.content }))

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
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: data.error || 'Something went wrong. Please try again or contact us on WhatsApp at +91 98320 11524.',
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
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
    <>
      {/* ─── Chat window ─────────────────────────────────────────────── */}
      <div
        className="chatbot-window"
        data-visible={isOpen}
        role="dialog"
        aria-label="AD-JEET Chat Assistant"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header__avatar">🏗️</div>
          <div className="chatbot-header__info">
            <div className="chatbot-header__name">JEET — AD-JEET Assistant</div>
            <div className="chatbot-header__status">Online</div>
          </div>
          <button
            className="chatbot-header__close"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role === 'assistant' ? 'bot' : 'user'}`}>
              <div className="chatbot-msg__avatar">
                {msg.role === 'assistant' ? '🏗️' : '👤'}
              </div>
              <div className="chatbot-msg__content">
                {formatContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chatbot-msg chatbot-msg--bot">
              <div className="chatbot-msg__avatar">🏗️</div>
              <div className="chatbot-msg__content">
                <div className="chatbot-typing">
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
          Powered by AD-JEET • For urgent queries, call +91 98320 11524
        </div>
      </div>

      {/* ─── Bubble button ────────────────────────────────────────────── */}
      <button
        className="chatbot-bubble"
        onClick={toggleChat}
        data-open={isOpen}
        aria-label={isOpen ? 'Close chat' : 'Open AD-JEET chat assistant'}
        aria-expanded={isOpen}
      >
        {showBadge && !isOpen && <span className="chatbot-badge" />}
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
          </svg>
        )}
      </button>
    </>
  )
}
