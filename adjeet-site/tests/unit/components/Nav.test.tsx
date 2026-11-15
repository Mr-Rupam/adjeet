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
