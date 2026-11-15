import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import { Clarity } from '@/components/Clarity'
import { CLARITY_ID } from '@/lib/analytics'

// next/script injects scripts on the client. Stand in with a plain element
// that records how each script would load.
vi.mock('next/script', () => ({
  default: ({ id, src, strategy, children }: { id?: string; src?: string; strategy?: string; children?: string }) => (
    <script data-id={id} data-src={src} data-strategy={strategy}>{children}</script>
  ),
}))

const storage: Record<string, string> = {}
type ClarityWindow = Window & { clarity?: (...args: unknown[]) => void }

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => storage[key] ?? null)
  Object.keys(storage).forEach(key => delete storage[key])
  delete (window as ClarityWindow).clarity
})

afterEach(cleanup)

function scripts(container: HTMLElement) {
  return [...container.querySelectorAll('script')].map(script => ({
    id: script.dataset.id,
    src: script.dataset.src,
    strategy: script.dataset.strategy,
    code: script.textContent ?? '',
  }))
}

describe('Clarity project id', () => {
  it('is the owner project id unless the environment overrides it', () => {
    expect(CLARITY_ID).toBe('ze7m2o8ov5')
  })

  it('can be overridden by NEXT_PUBLIC_CLARITY_ID', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_CLARITY_ID', 'override123')
    const fresh = await import('@/lib/analytics')
    expect(fresh.CLARITY_ID).toBe('override123')
    vi.unstubAllEnvs()
  })
})

describe('Clarity', () => {
  it('queues its calls at once and fetches the tag only once the page is idle, with the right id', () => {
    const { container } = render(<Clarity />)
    const loaded = scripts(container)
    expect(loaded.find(script => !script.src)?.strategy).toBe('afterInteractive')
    const tag = loaded.find(script => script.src?.includes('clarity.ms/tag/'))
    expect(tag?.src).toBe(`https://www.clarity.ms/tag/${CLARITY_ID}`)
    expect(tag?.strategy).toBe('lazyOnload')
  })

  it('starts with consent denied when no choice has been made, so it sets no cookies', () => {
    const { container } = render(<Clarity />)
    const code = scripts(container).find(script => !script.src)!.code
    expect(code).toContain("'consentv2'")
    expect(code).toMatch(/ad_Storage:\s*'denied'/)
    expect(code).toMatch(/analytics_Storage:\s*'denied'/)
  })

  it('starts with analytics consent granted and advertising denied once accepted', () => {
    storage['adjeet-consent'] = 'accepted'
    const { container } = render(<Clarity />)
    const code = scripts(container).find(script => !script.src)!.code
    expect(code).toMatch(/ad_Storage:\s*'denied'/)
    expect(code).toMatch(/analytics_Storage:\s*'granted'/)
  })

  it('loads nothing for a visitor who declined', () => {
    storage['adjeet-consent'] = 'declined'
    const { container } = render(<Clarity />)
    expect(scripts(container)).toEqual([])
  })

  it('grants analytics consent when the visitor accepts after the tag was queued', () => {
    const calls: unknown[][] = []
    ;(window as ClarityWindow).clarity = (...args: unknown[]) => { calls.push(args) }
    const { container } = render(<Clarity />)
    expect(scripts(container).length).toBe(2)
    storage['adjeet-consent'] = 'accepted'
    act(() => { window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: 'accepted' })) })
    expect(calls).toEqual([['consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' }]])
  })

  it('tells a tag that already loaded to stop and erase its cookies when the visitor declines', () => {
    const calls: unknown[][] = []
    ;(window as ClarityWindow).clarity = (...args: unknown[]) => { calls.push(args) }
    const { container } = render(<Clarity />)
    storage['adjeet-consent'] = 'declined'
    act(() => { window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: 'declined' })) })
    expect(calls).toEqual([
      ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }],
      ['consent', false],
    ])
    expect(scripts(container)).toEqual([])
  })

  it('does not create a Clarity function of its own when declining before any tag loaded', () => {
    render(<Clarity />)
    storage['adjeet-consent'] = 'declined'
    act(() => { window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: 'declined' })) })
    expect((window as ClarityWindow).clarity).toBeUndefined()
  })
})
