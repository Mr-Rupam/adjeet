'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/BrandLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { MAIN_TRADE_SLUGS, SERVICE_LINK_LABELS } from '@/content/site-links'

// "Areas" fits at 1024 px without wrapping: about 280 px of the header row
// was free there on 15 November 2026, and the link takes about 62 px with its gap.
const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/areas', label: 'Areas' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

/** The phone menu: the same pages, plus the main trades and brand teams. */
const MOBILE_LINKS = [
  {
    href: '/services',
    label: 'Services',
    children: MAIN_TRADE_SLUGS.map(slug => ({ href: `/services/${slug}`, label: SERVICE_LINK_LABELS[slug] })),
  },
  { href: '/areas', label: 'Areas we cover' },
  { href: '/for-brands', label: 'For brands' },
  ...NAV_LINKS.slice(2),
]

export function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className={`site-header fixed inset-x-0 top-0 z-40 ${isHome ? 'site-header--home' : ''}`}>
      <nav className="mx-auto flex h-20 max-w-content items-center justify-between gap-3 px-4 sm:px-5 md:h-[88px] md:px-8" aria-label="Main navigation">
        <BrandLogo priority />

        <ul className="m-0 hidden list-none items-center gap-7 p-0 lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden md:block">
            {/* Outlined, so the page's own gold WhatsApp button stays the one filled action on screen. */}
            <QuoteCTA source="nav" size="sm" label="Start a project" className="cta--quiet" />
          </span>
          <ThemeToggle />
          <MobileNav links={MOBILE_LINKS} />
        </div>
      </nav>
    </header>
  )
}
