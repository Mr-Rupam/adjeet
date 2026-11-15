import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeScene } from '@/components/home/ThemeScene'
import { buildSceneLayers } from '@/components/home/theme-scene-layers'

const WIDE = '(min-width: 1024px)'

// A scene below the fold, as the later bands use it.
const layers = () => buildSceneLayers({
  scenes: {
    day: { tall: '/scenes/workshop-day-tall.webp', wide: '/scenes/workshop-day-wide.webp', alt: 'Visualisation: the workshop by day' },
    night: { tall: '/scenes/workshop-night-tall.webp', wide: '/scenes/workshop-night-wide.webp', alt: 'Visualisation: the workshop at night' },
  },
  tallWidth: 941, tallHeight: 1672, wideWidth: 1672, wideHeight: 941,
  tallSizes: '100vw', wideSizes: '60vw',
})

const scene = () => <ThemeScene layers={layers()} wideScreen={WIDE} wideSizes="60vw" wideWidth={1672} wideHeight={941} />

describe('ThemeScene below the fold', () => {
  it('lazy-loads both cuts of both scenes and asks for no priority', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(scene()), 'text/html')
    const images = [...doc.querySelectorAll('img')]
    expect(images.map(image => image.getAttribute('data-scene-image'))).toEqual(['day', 'night'])
    for (const image of images) {
      expect(image.getAttribute('loading')).toBe('lazy')
      expect(image.getAttribute('fetchpriority')).toBeNull()
      expect(image.closest('picture')?.querySelector('source')?.getAttribute('media')).toBe(WIDE)
    }
    expect(decodeURIComponent(images[1].getAttribute('srcset') ?? '')).toContain('/scenes/workshop-night-tall.webp')
    expect(doc.querySelector('link[rel="preload"]')).toBeNull()
    expect(doc.querySelector('[data-both-scenes]')).toBeNull()
  })
})

describe('ThemeScene switching', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
    vi.stubGlobal('requestIdleCallback', () => 0)
    HTMLImageElement.prototype.decode = () => Promise.resolve()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.removeAttribute('data-theme')
  })

  it('follows the theme, lays out the other scene first and hides the outgoing one from assistive technology', async () => {
    const { container, unmount } = render(<ThemeScene layers={layers()} wideScreen={WIDE} wideSizes="60vw" wideWidth={1672} wideHeight={941} rootAttribute="data-test-light" />)
    const box = container.querySelector('[data-theme-scene]')!
    expect(box.getAttribute('data-light')).toBe('day')
    expect(document.documentElement.getAttribute('data-test-light')).toBe('day')

    await act(async () => { document.documentElement.setAttribute('data-theme', 'dark') })
    await vi.waitFor(() => expect(box.getAttribute('data-light')).toBe('night'))
    expect(document.documentElement.getAttribute('data-test-light')).toBe('night')
    expect(box.hasAttribute('data-both-scenes')).toBe(true)
    await vi.waitFor(() => expect(container.querySelector('[data-scene-image="day"]')?.getAttribute('aria-hidden')).toBe('true'))
    expect(container.querySelector('[data-scene-image="night"]')?.hasAttribute('aria-hidden')).toBe(false)

    unmount()
    expect(document.documentElement.hasAttribute('data-test-light')).toBe(false)
  })

  it('lays out the other scene as soon as the theme toggle is reached for', async () => {
    const { container } = render(<>{scene()}<button className="theme-toggle">Toggle</button></>)
    const box = container.querySelector('[data-theme-scene]')!
    expect(box.hasAttribute('data-both-scenes')).toBe(false)
    await act(async () => { container.querySelector('button')!.focus() })
    expect(box.hasAttribute('data-both-scenes')).toBe(true)
  })
})
