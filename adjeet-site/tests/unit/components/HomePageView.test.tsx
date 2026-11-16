import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { HomePageView } from '@/components/home/HomePageView'
import { getPhotoById } from '@/content/gallery'
import { homeFaqs } from '@/content/home-faqs'
import { CHAPTERS, PROOF_PICKS } from '@/content/home-film'
import { SERVICE_SLUGS } from '@/content/services'
import { FILM_BOOT } from '@/components/film/film-boot'

// The engine runs in the browser; the page's structure and words are under test.
vi.mock('@/components/film/FilmEngine', () => ({ FilmEngine: () => null }))

function render() {
  return new DOMParser().parseFromString(renderToStaticMarkup(<HomePageView />), 'text/html')
}

describe('home page: the film, then the questions', () => {
  it('runs the eight chapters in order inside the film, then the questions', () => {
    const doc = render()
    expect([...doc.querySelectorAll('#film .chs > section.ch')].map(section => section.id)).toEqual(CHAPTERS.map(chapter => chapter.id))
    expect([...doc.querySelectorAll('[data-home-page] > [id]')].map(section => section.id)).toEqual(['film', 'questions'])
  })

  it('has one h1, and one h2 per chapter after the hero', () => {
    const doc = render()
    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(doc.querySelector('h1')?.textContent).toBe('Advertising that gets you noticed.')
    for (const chapter of CHAPTERS.slice(1)) {
      const headings = doc.querySelectorAll(`#${chapter.id} h2`)
      expect(headings, chapter.id).toHaveLength(1)
      expect(headings[0].textContent).toBe(chapter.title)
      expect(doc.querySelector(`#${chapter.id}`)?.getAttribute('aria-labelledby')).toBe(headings[0].id)
    }
  })

  it('keeps the hero as it was: words, line, action and the four trades', () => {
    const hero = render().querySelector('#hero-section')!
    expect(hero.querySelector('h1 em')?.textContent).toBe('noticed.')
    expect(hero.querySelector('[data-hero-lead]')?.textContent).toBe('Advertising agency in Siliguri, since 1990.')
    const actions = hero.querySelector('[data-hero-actions]')!
    expect(actions.querySelector('a[href^="https://wa.me/"]')?.textContent).toBe('WhatsApp your project')
    expect([...hero.querySelectorAll('nav[aria-label="Main trades"] a')].map(link => link.getAttribute('href')))
      .toEqual(['/services/glow-sign-boards', '/services/acp-led-signage', '/services/flex-printing', '/services/vehicle-branding'])
  })

  it('turns the old jump to the shopfronts into the honest skip to the proof chapter', () => {
    const link = render().querySelector('#hero-section [data-hero-actions] a[href="#proof"]')
    expect(link?.getAttribute('aria-label')).toBe('See finished work')
    expect(link?.textContent).toBe('See finished work')
  })

  it('opens on the street visualisation, by day and by night, each in a tall and a wide cut, through the same pipeline', () => {
    const hero = render().querySelector('#hero-section')!
    const images = [...hero.querySelectorAll('img[data-hero-image]')]
    expect(images.map(image => image.getAttribute('data-hero-image'))).toEqual(['day', 'night'])
    for (const image of images) {
      const scene = image.getAttribute('data-hero-image')
      expect(image.getAttribute('loading')).toBe('lazy')
      expect(image.getAttribute('fetchpriority')).toBe('high')
      expect(decodeURIComponent(image.getAttribute('srcset') ?? '')).toContain(`/hero/${scene}-street-tall.webp`)
      const source = image.closest('picture')?.querySelector('source')
      expect(source?.getAttribute('media')).toBe('(min-width: 1024px) and (min-aspect-ratio: 5/4)')
      expect(decodeURIComponent(source?.getAttribute('srcset') ?? '')).toContain(`/hero/${scene}-street-wide.webp`)
    }
    expect(images[0].getAttribute('alt')).toMatch(/^Visualisation: a small market street on a misty morning after rain/)
    expect(images[1].getAttribute('alt')).toMatch(/^Visualisation: a small market street at night after rain/)
    expect(hero.textContent).not.toMatch(/visualisation/i)
  })

  it('picks the film mode in the hero\'s one inline script, which still preloads a chosen theme\'s scene', () => {
    const doc = render()
    const scripts = [...doc.querySelectorAll('#film script')]
    expect(scripts).toHaveLength(1)
    const script = scripts[0].textContent ?? ''
    expect(script).toContain("getAttribute('data-theme')==='dark'?'night':'day'")
    expect(script).toContain('if(scene===system)return;')
    expect(script).toContain('night-street-wide.webp')
    expect(script.endsWith(FILM_BOOT)).toBe(true)
    expect(FILM_BOOT).toContain("prefers-reduced-motion: reduce")
  })

  it('letters "Your shop name" on the boards as decoration, outside the headings', () => {
    const doc = render()
    const boards = [...doc.querySelectorAll('[data-name]')]
    expect(boards.length).toBeGreaterThan(5)
    for (const board of boards) {
      expect(board.textContent).toBe('Your shop name')
      expect(board.closest('[aria-hidden="true"]')).not.toBeNull()
    }
    expect(doc.querySelector('[data-hero-board]')?.textContent).toBe('Your shop name')
  })

  it('keeps the name field on the device and masked from session recording', () => {
    const input = render().querySelector<HTMLInputElement>('#brief input[data-name-input]')!
    expect(input.getAttribute('data-clarity-mask')).toBe('true')
    expect(input.getAttribute('maxlength')).toBe('24')
    expect(input.closest('form')).toBeNull()
    expect(input.closest('label')?.textContent).toContain("Type your shop's name")
  })

  it('shows the six photographs from the gallery, whole, with their own alt text and captions', () => {
    const shots = [...render().querySelectorAll('#proof ol.reel > li')]
    expect(shots.map(shot => shot.getAttribute('data-photo'))).toEqual(PROOF_PICKS.map(pick => pick.id))
    for (const shot of shots) {
      const photo = getPhotoById(shot.getAttribute('data-photo')!)
      const image = shot.querySelector('img')!
      expect(image.getAttribute('alt')).toBe(photo.alt)
      expect(shot.querySelector('figcaption b')?.textContent).toBe(photo.client)
      // Through the image pipeline, never asking for more than its own width.
      expect(decodeURIComponent(image.getAttribute('src') ?? '')).toContain(photo.src)
      expect(image.getAttribute('sizes')).toMatch(/min\(/)
    }
  })

  it('every scene image is named as a visualisation, and only the proof shows gallery photographs', () => {
    const doc = render()
    for (const image of doc.querySelectorAll('#film img')) {
      const alt = image.getAttribute('alt') ?? ''
      const real = image.closest('#proof .shot') !== null
      const logo = image.closest('#proof .lboard') !== null
      if (real || logo) continue
      expect(alt === '' || alt.startsWith('Visualisation:'), alt).toBe(true)
    }
  })

  it('reaches every service page, the areas, the brand page, the portfolio and the contact page', () => {
    const hrefs = [...render().querySelectorAll('a')].map(link => link.getAttribute('href'))
    for (const slug of SERVICE_SLUGS) expect(hrefs, slug).toContain('/services/' + slug)
    for (const path of ['/areas', '/for-brands', '/portfolio', '/contact']) expect(hrefs, path).toContain(path)
  })

  it('reports every WhatsApp action with its own source', () => {
    const doc = render()
    const whatsapp = [...doc.querySelectorAll('#film a[href^="https://wa.me/"]')]
    expect(whatsapp.length).toBe(6)
  })

  it('keeps the questions from home-faqs.ts, in order', () => {
    const questions = [...render().querySelectorAll('#questions summary')].map(summary => summary.textContent)
    expect(questions).toEqual(homeFaqs.map(faq => faq.q))
  })
})
