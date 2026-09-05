'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DISTRICTS_SERVED, FOUNDED_YEAR } from '@/lib/coverage'

interface NavLink { href: string; label: string }

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on route change — intentional direct setState to sync with external router state
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className="md:hidden border-2 border-ink px-3 py-1.5 text-ink transition-colors hover:bg-ink hover:text-paper"
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
                className="p-3 text-ink-muted hover:text-ink text-xl"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col px-8 pt-4">
              {links.map(({ href, label }, i) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`display flex items-baseline gap-4 border-b-2 border-rule py-5 text-5xl uppercase transition-colors ${
                      isActive ? 'text-signal' : 'text-ink hover:text-signal'
                    }`}
                  >
                    <span aria-hidden="true" className="spec text-ink-subtle">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {label}
                  </Link>
                )
              })}
              <p className="spec mt-8 text-ink-subtle">
                Est. {FOUNDED_YEAR} — Siliguri · {DISTRICTS_SERVED} districts · 500+ signs
              </p>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
