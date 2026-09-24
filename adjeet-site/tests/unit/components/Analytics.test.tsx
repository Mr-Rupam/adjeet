import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Analytics } from '@/components/Analytics'

// next/script injects scripts on the client. Stand in with a plain element
// that records how each script would load.
vi.mock('next/script', () => ({
  default: ({ id, src, strategy, children }: { id?: string; src?: string; strategy?: string; children?: string }) => (
    <script data-id={id} data-src={src} data-strategy={strategy}>{children}</script>
  ),
}))

const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => storage[key] ?? null)
  Object.keys(storage).forEach(key => delete storage[key])
})

function scripts(container: HTMLElement) {
  return [...container.querySelectorAll('script')].map(script => ({ src: script.dataset.src, strategy: script.dataset.strategy }))
}

describe('Analytics', () => {
  it('defines gtag() straight away but fetches gtag.js only once the page is idle', () => {
    const { container } = render(<Analytics />)
    const loaded = scripts(container)
    // The inline block queues page views and events in dataLayer until gtag.js arrives.
    expect(loaded.find(script => !script.src)?.strategy).toBe('afterInteractive')
    expect(loaded.find(script => script.src?.includes('googletagmanager.com/gtag/js'))?.strategy).toBe('lazyOnload')
  })

  it('loads nothing for a visitor who declined analytics', () => {
    storage['adjeet-consent'] = 'declined'
    const { container } = render(<Analytics />)
    expect(scripts(container)).toEqual([])
  })
})
