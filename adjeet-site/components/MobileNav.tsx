'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink { href: string; label: string }

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Focus the close button when drawer opens
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="md:hidden p-2 text-ink-muted hover:text-ink"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen(v => !v)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ background: 'var(--paper)' }}
          >
            <div className="flex justify-end p-6">
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-ink-muted hover:text-ink text-xl"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-8 px-10 pt-8">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-4xl font-[var(--font-fraunces)] font-bold text-ink hover:text-blue transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
