'use client'

import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import './Chatbot.css'

const loadPanel = () => import('./ChatPanel').then(module => module.ChatPanel)

/**
 * The panel (messages, suggestions, input) arrives in its own chunk the first
 * time a visitor reaches for the bubble: a hover or keyboard focus starts the
 * download, and the click mounts it. Until then a page carries only this
 * button, which phones do not even display.
 */
const ChatPanel = dynamic(loadPanel, { ssr: false })

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [requested, setRequested] = useState(false)
  const [showBadge, setShowBadge] = useState(true)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const toggleChat = () => {
    setRequested(true)
    setIsOpen((prev) => !prev)
    setShowBadge(false)
  }
  const closeChat = useCallback(() => setIsOpen(false), [])
  const preload = () => { void loadPanel() }

  return (
    <>
      {requested && <ChatPanel isOpen={isOpen} onClose={closeChat} triggerRef={triggerRef} />}

      <button
        ref={triggerRef}
        className="chatbot-bubble"
        onClick={toggleChat}
        onPointerEnter={preload}
        onFocus={preload}
        data-open={isOpen}
        aria-label={isOpen ? 'Close chat' : 'Open AD JEET chat assistant'}
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
