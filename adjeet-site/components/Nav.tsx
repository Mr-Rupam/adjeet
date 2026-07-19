'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-ink bg-paper">
      <nav
        className="mx-auto flex h-16 max-w-content items-stretch justify-between px-5 md:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          aria-label="AD JEET home"
          className="flex shrink-0 items-center gap-2.5 self-center"
        >
          <span aria-hidden="true" className="block h-3.5 w-3.5 shrink-0 bg-signal" />
          <span className="display glow-tube whitespace-nowrap text-2xl leading-none text-ink">
            AD JEET
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="m-0 hidden list-none items-stretch p-0 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`spec relative inline-flex items-center px-4 transition-colors lg:px-5 ${
                    isActive
                      ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-signal'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex shrink-0 items-center gap-2.5 self-center">
          <span className="hidden md:block">
            <QuoteCTA source="nav" size="sm" />
          </span>
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  )
}
