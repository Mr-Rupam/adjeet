'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'
import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { MAIN_TRADE_SLUGS, SERVICE_LINK_LABELS } from '@/content/site-links'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/for-brands', label: 'For Brands' },
  { href: '/areas', label: 'Areas' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

/** The phone menu: the same pages, plus the main trades under Services. */
const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  {
    href: '/services',
    label: 'Services',
    children: MAIN_TRADE_SLUGS.map(slug => ({ href: `/services/${slug}`, label: SERVICE_LINK_LABELS[slug] })),
  },
  { href: '/for-brands', label: 'For Brands' },
  { href: '/areas', label: 'Areas we cover' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

/**
 * On the home page the header sits straight on the night hero (no cream bar)
 * until the hero has scrolled up past it, then it is the usual header again.
 * The server renders the home header as "over the hero", so the first paint
 * is right before any script runs. Other routes never use this state.
 */
function useOverHero(isHome: boolean, pathname: string, header: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ path: pathname, over: true })

  useEffect(() => {
    if (!isHome) return
    let frame = 0
    const update = () => {
      frame = 0
      // While the home film plays the header stays on the artwork through the
      // whole film, taking its ink from each stage (components/film/film.css);
      // in the still frames it is over the hero only, as before the film.
      const film = document.documentElement.classList.contains('story')
      const hero = document.getElementById(film ? 'film' : 'hero-section')
      const over = Boolean(hero && header.current && hero.getBoundingClientRect().bottom > header.current.offsetHeight)
      setState(current => (current.path === pathname && current.over === over ? current : { path: pathname, over }))
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      // Leaving the home page: the next visit opens at the top, over the hero,
      // not in the state the last visit was scrolled to.
      setState({ path: pathname, over: true })
    }
  }, [isHome, pathname, header])

  return isHome && (state.path === pathname ? state.over : true)
}

// Without JavaScript nothing switches the header back to the cream bar, so on
// the home page it scrolls away with the hero instead of floating, unreadable,
// over the cream sections below.
const NO_SCRIPT_HEADER = '<style>.site-header--over-hero{position:absolute}</style>'

export function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const headerRef = useRef<HTMLElement>(null)
  const overHero = useOverHero(isHome, pathname, headerRef)

  return (
    <header
      ref={headerRef}
      className={`site-header fixed inset-x-0 top-0 z-40 ${isHome ? 'site-header--home' : ''} ${overHero ? 'site-header--over-hero' : ''}`}
      data-over-hero={isHome ? String(overHero) : undefined}
    >
      {isHome && <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_HEADER }} />}
      <nav className="mx-auto flex h-20 max-w-content items-center justify-between gap-3 px-4 sm:px-5 md:h-[88px] md:px-8" aria-label="Main navigation">
        <BrandLogo priority />

        <ul className="m-0 hidden list-none items-center gap-7 p-0 lg:flex">
          {NAV_LINKS.map(({ href, label }) => {
            // Home matches only the exact route, or it would be current everywhere.
            const isActive = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
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
