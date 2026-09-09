import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MobileNav } from '@/components/MobileNav'
import Link from 'next/link'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/components/BrandLogo', () => ({ BrandLogo: () => <Link href="/">AD JEET home</Link> }))
vi.mock('@/components/ui/QuoteCTA', () => ({ QuoteCTA: () => <Link href="/contact">Start a project</Link> }))

const links = [{ href: '/services', label: 'Services' }, { href: '/portfolio', label: 'Work' }]
let desktopListener: ((event: MediaQueryListEvent) => void) | undefined

beforeEach(() => {
  desktopListener = undefined
  document.body.style.overflow = ''
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: (_type: string, listener: typeof desktopListener) => { desktopListener = listener },
    removeEventListener: vi.fn(),
  })))
})

describe('MobileNav', () => {
  it('closes with Escape, restores focus and restores the previous scroll state', () => {
    document.body.style.overflow = 'auto'
    render(<MobileNav links={links} />)
    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })
    fireEvent.click(trigger)
    expect(document.body.style.overflow).toBe('hidden')
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close navigation menu' })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('auto')
    expect(trigger).toHaveFocus()
  })

  it('keeps forward and backward keyboard focus inside the open menu', () => {
    render(<MobileNav links={links} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const drawer = within(screen.getByRole('dialog'))
    const first = drawer.getByRole('link', { name: 'AD JEET home' })
    const last = drawer.getByRole('link', { name: 'Start a project' })
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
  })

  it('closes the drawer and releases scroll when the desktop links take over', () => {
    render(<MobileNav links={links} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    act(() => desktopListener?.({ matches: true } as MediaQueryListEvent))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes after choosing a destination', () => {
    render(<MobileNav links={links} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: /Services/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})
