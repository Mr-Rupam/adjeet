'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { motion, AnimatePresence } from 'framer-motion'

export function Hero() {
  const [text, setText] = useState('AD-JEET')
  const [isFocused, setIsFocused] = useState(false)
  const [colorTheme, setColorTheme] = useState<'pink' | 'blue' | 'gold'>('pink')
  const inputRef = useRef<HTMLInputElement>(null)
  const waUrl = defaultWhatsAppUrl()

  // Focus input on load for immediate interaction if desktop
  useEffect(() => {
    // Optional: auto-focus on load, but might be annoying on mobile.
    // We'll let them click to edit.
  }, [])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length <= 15) { // Limit length
      setText(val)
    }
  }

  return (
    <section className={`sandbox-hero theme-${colorTheme}`}>
      {/* Brick wall / dark studio background */}
      <div className="sandbox-bg" />

      {/* Wiring / Grid behind the sign */}
      <div className="sandbox-grid" aria-hidden="true" />

      <div className="sandbox-content">
        
        {/* The Interactive Neon Sign Area */}
        <div 
          className="neon-container" 
          onClick={handleContainerClick}
          title="Click to edit your sign"
        >
          {/* Subtle mounting bracket lines */}
          <div className="mounting-rail rail-top" />
          <div className="mounting-rail rail-bottom" />

          {/* Hidden input for capturing keyboard events natively */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="hidden-input"
            spellCheck={false}
            autoComplete="off"
            aria-label="Edit neon sign text"
          />

          {/* The visible glowing text */}
          <h1 className="neon-text">
            {text === '' ? (
              <span className="neon-placeholder">TYPE YOUR NAME</span>
            ) : (
              <AnimatePresence mode="popLayout">
                {text.split('').map((char, i) => (
                  <motion.span
                    key={`${i}-${char}`}
                    initial={{ opacity: 0, scale: 0.8, filter: 'brightness(2)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
                    exit={{ opacity: 0, scale: 1.2, filter: 'brightness(0)' }}
                    transition={{ duration: 0.15 }}
                    className="neon-char"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </AnimatePresence>
            )}
            {/* Blinking cursor when focused */}
            <span className={`neon-cursor ${isFocused ? 'active' : ''}`} />
          </h1>
          
          <div className="edit-hint">
            <span className="pulse-dot" /> {isFocused ? 'Typing...' : 'Click the sign to edit'}
          </div>
        </div>

        {/* Controls & CTAs */}
        <div className="sandbox-controls">
          
          <div className="color-picker">
            <span className="picker-label">NEON GAS:</span>
            <button 
              onClick={() => setColorTheme('pink')}
              className={`color-btn btn-pink ${colorTheme === 'pink' ? 'active' : ''}`}
              aria-label="Neon Pink"
            />
            <button 
              onClick={() => setColorTheme('blue')}
              className={`color-btn btn-blue ${colorTheme === 'blue' ? 'active' : ''}`}
              aria-label="Argon Blue"
            />
            <button 
              onClick={() => setColorTheme('gold')}
              className={`color-btn btn-gold ${colorTheme === 'gold' ? 'active' : ''}`}
              aria-label="Warm Gold"
            />
          </div>

          <p className="sandbox-pitch">
            See it in lights. We fabricate custom neon, LED, and architectural signage for brands across North Bengal.
          </p>

          <div className="sandbox-ctas">
            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary-neon"
            >
              Let&apos;s build this →
            </a>
            <Link href="/portfolio" className="btn-secondary-outline">
              View our portfolio
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
