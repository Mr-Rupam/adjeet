import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoverageStage } from '@/components/coverage/CoverageStage'

// three.js cannot run in jsdom, and the gate is what is under test here, not
// the scene. The stub stands in for the lazily loaded terrain chunk, and each
// test chooses how it behaves: draw its first frame, report a failure the way a
// missing relief or a lost WebGL context does, or throw the way a refused
// context or a chunk that failed to load does.
const terrainStub = vi.hoisted(() => ({ mode: 'draws' as 'draws' | 'reports-failure' | 'throws' }))

vi.mock('@/components/coverage/CoverageTerrain', async () => {
  const React = await import('react')
  function CoverageTerrain({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
    if (terrainStub.mode === 'throws') throw new Error('WebGL context could not be created')
    React.useEffect(() => {
      if (terrainStub.mode === 'reports-failure') onFail()
      else onReady()
    }, [onReady, onFail])
    return React.createElement('div', { 'data-testid': 'coverage-terrain' })
  }
  return { CoverageTerrain }
})

/** A media query whose answer changes under the page, as it does on resize or a settings change. */
function fakeQuery(initial: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches: initial,
    addEventListener: (_type: string, listener: () => void) => { listeners.add(listener) },
    removeEventListener: (_type: string, listener: () => void) => { listeners.delete(listener) },
    change(next: boolean) {
      query.matches = next
      listeners.forEach(listener => listener())
    },
    listenerCount: () => listeners.size,
  }
  return query
}

function installMedia({ wide, reducedMotion }: { wide: boolean; reducedMotion: boolean }) {
  const queries = { wide: fakeQuery(wide), still: fakeQuery(reducedMotion) }
  vi.stubGlobal('matchMedia', vi.fn((query: string) =>
    query.includes('prefers-reduced-motion') ? queries.still : queries.wide))
  return queries
}

/** Stands in for the browser's IntersectionObserver, so a test can decide when the map is on screen. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly observed: Element[] = []
  disconnected = false
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  observe(node: Element) { this.observed.push(node) }
  unobserve() {}
  disconnect() { this.disconnected = true }
  takeRecords(): IntersectionObserverEntry[] { return [] }

  report(isIntersecting: boolean) {
    const entries = this.observed.map(target => ({ isIntersecting, target }) as IntersectionObserverEntry)
    this.callback(entries, this as unknown as IntersectionObserver)
  }
}

function withWebGL(support: 'webgl2' | 'none' | 'throws') {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => {
    if (support === 'throws') throw new Error('Canvas access blocked')
    return support === 'webgl2' && type === 'webgl2' ? ({} as WebGL2RenderingContext) : null
  }) as unknown as HTMLCanvasElement['getContext'])
}

const ELEVATION = /elevation from public terrain data/i

function renderStage() {
  const view = render(
    <CoverageMapProvider>
      <CoverageStage caption="Coverage shown approximately." />
    </CoverageMapProvider>,
  )
  const surface = view.container.querySelector<HTMLElement>('[data-terrain]')
  if (!surface) throw new Error('The map surface did not render')
  return { ...view, surface }
}

beforeEach(() => {
  terrainStub.mode = 'draws'
  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CoverageStage terrain gate', () => {
  // The gate used to read the viewport once at mount, so anyone who arrived
  // narrow and then widened the window was stuck on the flat map for the visit.
  it('arms the terrain once the window widens, keeps it when the window narrows, and stops listening on unmount', async () => {
    const media = installMedia({ wide: false, reducedMotion: false })
    withWebGL('webgl2')
    const { surface, unmount } = renderStage()

    expect(surface).toHaveAttribute('data-terrain', 'off')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
    // The flat map draws no relief, so the caption must not describe any.
    expect(screen.queryByText(ELEVATION)).not.toBeInTheDocument()

    act(() => media.wide.change(true))
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
    const [observer] = FakeIntersectionObserver.instances
    expect(observer.observed).toEqual([surface])

    // Near the map but not on it yet: still deferred.
    act(() => observer.report(false))
    expect(surface).toHaveAttribute('data-terrain', 'off')

    act(() => observer.report(true))
    // Mounting is not drawing: the flat map stays until the first frame lands.
    expect(surface).toHaveAttribute('data-terrain', 'loading')
    expect(observer.disconnected).toBe(true)
    expect(await screen.findByTestId('coverage-terrain')).toBeInTheDocument()
    await waitFor(() => expect(surface).toHaveAttribute('data-terrain', 'ready'))
    expect(screen.getByText(ELEVATION)).toBeInTheDocument()

    // Once downloaded, the terrain stays, and no second observer is armed.
    act(() => media.wide.change(false))
    act(() => media.wide.change(true))
    expect(surface).toHaveAttribute('data-terrain', 'ready')
    expect(FakeIntersectionObserver.instances).toHaveLength(1)

    unmount()
    expect(media.wide.listenerCount()).toBe(0)
    expect(media.still.listenerCount()).toBe(0)
  })

  it('keeps reduced motion and browsers without usable WebGL on the flat map, even on a wide screen', () => {
    // Reduced motion, with everything else in favour of the terrain.
    const media = installMedia({ wide: true, reducedMotion: true })
    withWebGL('webgl2')
    const first = renderStage()
    expect(first.surface).toHaveAttribute('data-terrain', 'off')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)

    // Turning reduced motion off is watched too, not only the width.
    act(() => media.still.change(false))
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
    first.unmount()
    vi.restoreAllMocks()
    FakeIntersectionObserver.instances = []

    // No WebGL context at all.
    installMedia({ wide: true, reducedMotion: false })
    withWebGL('none')
    const second = renderStage()
    expect(second.surface).toHaveAttribute('data-terrain', 'off')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
    second.unmount()
    vi.restoreAllMocks()

    // A canvas that throws when asked for a context, as a locked down browser can.
    installMedia({ wide: true, reducedMotion: false })
    withWebGL('throws')
    const third = renderStage()
    expect(third.surface).toHaveAttribute('data-terrain', 'off')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })
})

describe('CoverageStage terrain failure', () => {
  /** A desktop visitor with WebGL, scrolled to the map, so the terrain mounts. */
  function renderArmedStage() {
    installMedia({ wide: true, reducedMotion: false })
    withWebGL('webgl2')
    const view = renderStage()
    act(() => FakeIntersectionObserver.instances[0].report(true))
    return view
  }

  // The flat map used to fade as soon as the chunk mounted. A terrain that then
  // threw would leave nothing behind, and with no error boundary the error went
  // on up and took the page section down with it.
  it('keeps the flat map when the terrain throws, instead of losing the section', async () => {
    terrainStub.mode = 'throws'
    // React reports errors its boundaries catch; that output is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { surface } = renderArmedStage()

    await waitFor(() => expect(surface).toHaveAttribute('data-terrain', 'failed'))
    expect(screen.queryByTestId('coverage-terrain')).not.toBeInTheDocument()
    expect(surface.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText(ELEVATION)).not.toBeInTheDocument()
  })

  it('hands back to the flat map when the relief cannot load or WebGL is lost', async () => {
    terrainStub.mode = 'reports-failure'
    const { surface } = renderArmedStage()

    await waitFor(() => expect(surface).toHaveAttribute('data-terrain', 'failed'))
    expect(screen.queryByTestId('coverage-terrain')).not.toBeInTheDocument()
    expect(surface.querySelector('svg')).toBeInTheDocument()
    expect(screen.queryByText(ELEVATION)).not.toBeInTheDocument()
  })
})
