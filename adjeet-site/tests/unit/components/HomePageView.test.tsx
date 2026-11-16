import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { HomePageView } from '@/components/home/HomePageView'
import { getPhotoById, photos } from '@/content/gallery'

// The map islands and the motion layer render nothing here; the page structure
// and the facts it shows are under test.
vi.mock('@/components/coverage/CoverageStage', () => ({ CoverageStage: () => null }))
vi.mock('@/components/coverage/CoveragePlaceList', () => ({ CoveragePlaceList: () => null }))
vi.mock('@/components/motion/HomeMotion', () => ({ HomeMotion: () => null }))
vi.mock('@/components/motion/ReducedMotionWrapper', () => ({ useReducedMotion: () => false }))

function render() {
  return new DOMParser().parseFromString(renderToStaticMarkup(<HomePageView />), 'text/html')
}

const textOf = (url: string | null | undefined) => new URL(url ?? '').searchParams.get('text') ?? ''

describe('storefront homepage', () => {
  it('runs shopfront, examples, trust, sign choice, process, places, then the enquiry', () => {
    const ids = [...render().querySelectorAll('[data-home-page] > [id]')].map(section => section.id)
    expect(ids).toEqual(['hero-section', 'selected-work', 'client-history', 'services', 'how-it-works', 'areas'])
  })

  it('shows the client board with no note about regional agencies', () => {
    // The owner took that note off /for-brands and then off this board on 16 November 2026.
    const board = render().querySelector('#client-history')!
    expect(board.querySelector('h2')?.textContent).toBe('Names you know.Work you can see.')
    expect(board.textContent).not.toMatch(/regional agenc/i)
  })

  it('names the trade and the town under a strong headline, in one line', () => {
    const doc = render()
    expect(doc.querySelector('h1')?.textContent).toBe('Advertising that gets you noticed.')
    expect(doc.querySelector('h1 em')?.textContent).toBe('noticed.')
    // 15 November 2026: the lead's second sentence left the hero.
    expect(doc.querySelector('[data-hero-lead]')?.textContent).toBe('Advertising agency in Siliguri, since 1990.')
    expect(doc.querySelector('#hero-section')?.textContent).not.toContain('Send a photo of your shop to start.')
  })

  it('opens on the street visualisation, by day and by night, each in a tall and a wide cut', () => {
    const hero = render().querySelector('#hero-section')!
    const images = [...hero.querySelectorAll('img')]
    expect(images.map(image => image.getAttribute('data-hero-image'))).toEqual(['day', 'night'])
    for (const image of images) {
      const scene = image.getAttribute('data-hero-image')
      // Lazy, so only the scene laid out (the visitor's theme) is fetched; the inline script preloads it.
      expect(image.getAttribute('loading')).toBe('lazy')
      expect(image.getAttribute('fetchpriority')).toBe('high')
      expect(decodeURIComponent(image.getAttribute('srcset') ?? '')).toContain(`/hero/${scene}-street-tall.webp`)
      const source = image.closest('picture')?.querySelector('source')
      expect(source?.getAttribute('media')).toBe('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
      expect(decodeURIComponent(source?.getAttribute('srcset') ?? '')).toContain(`/hero/${scene}-street-wide.webp`)
    }
    expect(images[0].getAttribute('alt')).toMatch(/^Visualisation: a small market street on a misty morning after rain/)
    expect(images[1].getAttribute('alt')).toMatch(/^Visualisation: a small market street at night after rain/)
    // Since 16 November 2026 a concept scene carries no visible label: the
    // alt text above says what it is (DESIGN.md).
    expect(hero.querySelector('[data-hero-label]')).toBeNull()
    expect(hero.textContent).not.toMatch(/visualisation/i)
  })

  it('preloads the scene for a theme opposite to the system one from an inline script', () => {
    const script = render().querySelector('#hero-section > script')?.textContent ?? ''
    expect(script).toContain("getAttribute('data-theme')==='dark'?'night':'day'")
    // The system theme's scene is preloaded from <head>, so the script only covers a chosen theme.
    expect(script).toContain('if(scene===system)return;')
    expect(script).toContain('day-street-tall.webp')
    expect(script).toContain('night-street-wide.webp')
    expect(script).toContain("setAttribute('fetchpriority','high')")
  })

  it('sets "Your shop name" on the blank board as decoration, outside the heading and the image text', () => {
    const hero = render().querySelector('#hero-section')!
    const board = hero.querySelector('[data-hero-board]')
    expect(board?.textContent).toBe('Your shop name')
    expect(board?.getAttribute('aria-hidden')).toBe('true')
    expect(hero.querySelector('h1')?.textContent).not.toContain('Your shop name')
  })

  it('keeps the WhatsApp action and the jump to real work, and no photo slideshow, in the hero', () => {
    const hero = render().querySelector('#hero-section')!
    const actions = hero.querySelector('[data-hero-actions]')!
    expect(actions.querySelector('a[href^="https://wa.me/"]')?.textContent).toBe('WhatsApp your project')
    expect(actions.querySelector('a[href="#selected-work"]')?.getAttribute('aria-label')).toBe('See finished shopfronts')
    expect(hero.querySelectorAll('[data-hero-slide], [data-hero-caption]')).toHaveLength(0)
    expect(hero.querySelector('a[href^="/portfolio"]')).toBeNull()
    expect(hero.querySelector('button')).toBeNull()
  })

  it('shows the three selected shopfronts, each with an enquiry that carries its reference', () => {
    const items = [...render().querySelectorAll('#selected-work li')]
    expect(items).toHaveLength(3)
    const expected = [
      { id: 'tanyamakeovers-154', line: 'Lit studio lettering · Siliguri' },
      { id: 'acc-125', line: 'ACP shopfront fascia · Dalkhola' },
      { id: 'anchor-by-panasonic-112', line: 'Jai Maa Anjani Electricals · Shop board' },
    ]
    expected.forEach(({ id, line }, index) => {
      const item = items[index]
      const photo = getPhotoById(id)
      expect(item.querySelector('img')?.getAttribute('alt')).toBe(photo.alt)
      expect(item.querySelector('figcaption strong')?.textContent).toBe(photo.client)
      expect(item.querySelector('figcaption strong + span')?.textContent).toBe(line)
      const message = textOf(item.querySelector('a[href^="https://wa.me/"]')?.getAttribute('href'))
      expect(message).toContain(`(${id})`)
      expect(message).toContain('My shop is in ___.')
    })
  })

  it('claims a place for an example only where the gallery records one', () => {
    expect(getPhotoById('tanyamakeovers-154').location).toBe('Siliguri')
    expect(getPhotoById('acc-125').location).toBe('Dalkhola')
    expect(getPhotoById('anchor-by-panasonic-112').location).toBeUndefined()
  })

  it('links the four main trades, the full portfolio and every area served', () => {
    const doc = render()
    const hrefs = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href'))
    for (const slug of ['glow-sign-boards', 'acp-led-signage', 'flex-printing', 'vehicle-branding']) {
      expect(hrefs).toContain('/services/' + slug)
    }
    expect(hrefs).toContain('/areas')
    expect(hrefs).toContain('/portfolio')
    expect(doc.querySelector('#selected-work a[href="/portfolio"]')?.textContent).toContain(`See all ${photos.length} project photographs`)
  })

  it('compares the two main sign choices from the shared comparison records', () => {
    const doc = render()
    const choices = [...doc.querySelectorAll('#services article h3')].map(heading => heading.textContent)
    expect(choices).toEqual(['Glow sign board', 'ACP board with 3D LED letters'])
  })

  it('uses real workshop photography, never the generated bench image', () => {
    // Image URLs are encoded by the optimiser, so match the file names.
    const html = renderToStaticMarkup(<HomePageView />)
    expect(html).toContain('workshop-gate.webp')
    expect(html).not.toContain('led-letter-workshop-interior-visualisation')
  })
})
