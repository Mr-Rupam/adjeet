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
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-paper flex flex-col"
        >
          <div className="flex justify-end p-6">
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-8 pt-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-3xl font-bold text-ink hover:text-blue transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
