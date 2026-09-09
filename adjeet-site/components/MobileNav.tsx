'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

interface NavLink {
  href: string
  label: string
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  const [openPath, setOpenPath] = useState<string | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const open = openPath === pathname

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    const desktop = window.matchMedia('(min-width: 1024px)')
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpenPath(null)
      }
      if (event.key !== 'Tab') return

      const targets = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!targets?.length) return
      const first = targets[0]
      const last = targets[targets.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    desktop.addEventListener('change', closeAtDesktop)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      desktop.removeEventListener('change', closeAtDesktop)
      if (!desktop.matches) trigger?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        className="mobile-nav-trigger"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        type="button"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        {open ? <X size={21} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
      </button>

      {open && createPortal(
        <div ref={drawerRef} id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu" className="mobile-nav-drawer">
          <div className="mobile-nav-drawer__top">
            <BrandLogo />
            <button ref={closeRef} type="button" onClick={() => setOpenPath(null)} aria-label="Close navigation menu" className="mobile-nav-close">
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav className="mobile-nav-drawer__links" aria-label="Mobile navigation">
            {links.map((link, index) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  href={link.href}
                  key={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'mobile-nav-link mobile-nav-link--active' : 'mobile-nav-link'}
                  onClick={() => setOpenPath(null)}
                >
                  <span className="spec" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="mobile-nav-drawer__cta">
            <p>Have a site, a size, or a photo? Start there.</p>
            <QuoteCTA source="mobile-drawer" label="Talk on WhatsApp" className="w-full" />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
