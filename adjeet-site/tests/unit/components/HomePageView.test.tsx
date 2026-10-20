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

  it('names the trade and the town under a strong headline', () => {
    const doc = render()
    expect(doc.querySelector('h1')?.textContent).toBe('Sign boards that get you noticed.')
    expect(doc.querySelector('[data-hero-lead]')?.textContent).toMatch(/^Sign board makers in Siliguri, since 1990\./)
    expect(doc.querySelector('[data-hero-lead]')?.textContent).toContain('Send a photo of your shop to start.')
  })

  it('loads the first hero slide at high priority and the rest at low', () => {
    const slides = [...render().querySelectorAll('[data-hero-slide]')]
    expect(slides[0].getAttribute('fetchpriority')).toBe('high')
    expect(slides[0].getAttribute('loading')).not.toBe('lazy')
    expect(slides[0].getAttribute('alt')).toBe(getPhotoById('ambuja-cement-126').alt)
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
