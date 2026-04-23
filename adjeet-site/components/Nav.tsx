import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-rule">
      <nav
        className="mx-auto flex max-w-content items-center justify-between px-6 h-16"
        aria-label="Main navigation"
      >
        <Link href="/" className="font-bold text-ink text-lg tracking-tight">
          AD-JEET
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-ink-muted hover:text-ink text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  )
}
