'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/BrandLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
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
            <QuoteCTA source="nav" size="sm" label="Start a project" />
          </span>
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  )
}
