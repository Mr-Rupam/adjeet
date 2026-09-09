'use client'

import { useEffect, useRef, useState } from 'react'
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
  const open = openPath === pathname

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="mobile-nav-trigger md:hidden"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        type="button"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        {open ? <X size={21} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
      </button>

      {open && (
        <div id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu" className="mobile-nav-drawer">
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
        </div>
      )}
    </>
  )
}
