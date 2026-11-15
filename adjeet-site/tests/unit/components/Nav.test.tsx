import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Nav } from '@/components/Nav'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

function header() {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Nav />), 'text/html')
  return doc.querySelector('header')!
}

beforeEach(() => { pathname = '/' })

// The browser behaviour (the cream bar returning once the hero has scrolled
// past) is covered end to end in tests/e2e/home-hero.spec.ts.
describe('site header', () => {
  it('is server-rendered over the home hero, so it is right before any script runs', () => {
    const element = header()
    expect(element.classList).toContain('site-header--over-hero')
    expect(element.getAttribute('data-over-hero')).toBe('true')
    // Without JavaScript it scrolls away with the hero instead of floating over the cream sections.
    expect(element.querySelector('noscript')?.innerHTML).toContain('.site-header--over-hero{position:absolute}')
  })

  function desktopLinks() {
    const list = header().querySelector('ul')!
    return [...list.querySelectorAll('a')].map(a => ({
      label: a.textContent,
      href: a.getAttribute('href'),
      current: a.getAttribute('aria-current'),
    }))
  }

  it('lists Home, Services and For Brands ahead of Portfolio, About and Contact', () => {
    const labels = desktopLinks().map(l => l.label)
    expect(labels.slice(0, 3)).toEqual(['Home', 'Services', 'For Brands'])
    expect(labels.slice(-3)).toEqual(['Portfolio', 'About', 'Contact'])
    expect(desktopLinks().find(l => l.label === 'For Brands')?.href).toBe('/for-brands')
    expect(desktopLinks().find(l => l.label === 'Home')?.href).toBe('/')
  })

  it('marks Home as the current page only on the exact home route', () => {
    expect(desktopLinks().filter(l => l.current).map(l => l.label)).toEqual(['Home'])
    pathname = '/services/glow-sign-boards'
    expect(desktopLinks().filter(l => l.current).map(l => l.label)).toEqual(['Services'])
  })

  it('marks For Brands as current on its own page', () => {
    pathname = '/for-brands'
    expect(desktopLinks().filter(l => l.current).map(l => l.label)).toEqual(['For Brands'])
  })

  it('keeps the usual header on every other route', () => {
    for (const path of ['/about', '/services', '/services/glow-sign-boards', '/contact']) {
      pathname = path
      const element = header()
      expect(element.classList, path).not.toContain('site-header--over-hero')
      expect(element.hasAttribute('data-over-hero'), path).toBe(false)
      expect(element.querySelector('noscript'), path).toBeNull()
    }
  })
})
