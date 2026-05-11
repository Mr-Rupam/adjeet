'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-rule">
      <nav
        className="mx-auto flex max-w-content items-center justify-between px-6 h-16"
        aria-label="Main navigation"
      >
        <Link href="/" aria-label="AD-JEET home" className="flex items-center">
          <Image
            src="/logo.png"
            alt="AD-JEET — North Bengal Signage"
            height={36}
            width={148}
            className="object-contain"
            style={{ width: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-ink border-b-2 border-blue'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  )
}
