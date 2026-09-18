'use client'

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useCoverageMap } from './CoverageMapContext'
import { CoverageMapFlat } from './CoverageMapFlat'
import { REACH_RINGS_KM } from '@/lib/coverage-places'
import styles from './CoverageMap.module.css'

/**
 * The terrain is the whole reason three.js is in this project, and its chunk is
 * close to 900kb before compression. Nothing imports it statically: it arrives
 * in its own chunk, only for the visitors established below, and only once the
 * map is actually on screen. `ssr: false` because a WebGL canvas has nothing to
 * prerender.
 */
const CoverageTerrain = dynamic(
  () => import('./CoverageTerrain').then(module => module.CoverageTerrain),
  { ssr: false },
)

/** Below this width the terrain is too small to read and too costly to justify. */
const TERRAIN_MIN_WIDTH = 1024

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    // Browsers cap live WebGL contexts, and the terrain is about to ask for its
    // own. Give the probe back instead of leaving it for the garbage collector.
    const probe = context as WebGLRenderingContext | null
    probe?.getExtension?.('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}

/**
 * Decides whether this visitor gets the terrain, and defers it until the map is
 * near the viewport.
 *
 * Phones, reduced-motion visitors and anything without WebGL never load the
 * chunk at all. They are not getting a degraded map; they are getting the flat
 * one, which does everything the terrain does.
 *
 * Both media queries are watched rather than read once, because the answer
 * changes under us: a window gets maximised, a tablet gets rotated, someone
 * turns off reduced motion. Reading at mount only meant anyone who arrived
 * narrow and then widened was stuck on the flat map for the rest of the visit.
 *
 * Once granted the terrain stays, even if the window narrows again. The gate
 * exists to keep that chunk off phones, and a visitor who has already
 * downloaded it gains nothing from having the WebGL context torn down.
 */
function useTerrainGate(target: React.RefObject<HTMLElement | null>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const node = target.current
    if (!node) return

    const wide = window.matchMedia(`(min-width: ${TERRAIN_MIN_WIDTH}px)`)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | null = null

    const evaluate = () => {
      if (observer) return
      if (!wide.matches || still.matches || !hasWebGL()) return

      observer = new IntersectionObserver(
        entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            setReady(true)
            observer?.disconnect()
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(node)
    }

    evaluate()
    wide.addEventListener('change', evaluate)
    still.addEventListener('change', evaluate)

    return () => {
      observer?.disconnect()
      wide.removeEventListener('change', evaluate)
      still.removeEventListener('change', evaluate)
    }
  }, [target])

  return ready
}

/**
 * What the map is currently pointing at.
 *
 * Every place gets the same card: where it is, how far the vans travel to reach
 * it, and one way to start a job there. There is deliberately no project count
 * and no photo strip. Grading places by how much of each one the gallery could
 * evidence made the map read as a record of past work rather than a statement
 * of where the company goes.
 */
function CoverageDetail() {
  const { active } = useCoverageMap()
  const outer = REACH_RINGS_KM[REACH_RINGS_KM.length - 1]

  // One wrapper that is always mounted. A live region that gets created and
  // destroyed along with its contents announces nothing, because the region has
  // to exist before the text changes inside it.
  return (
    <div className={styles.detail} aria-live="polite">
      {!active ? (
        <p className={styles.detailIntro}>
          Siliguri is the workshop. The rings mark {REACH_RINGS_KM.join(', ')} kilometres out,
          and every place we name sits inside {outer}.
        </p>
      ) : (
        <>
          <div className={styles.detailHead}>
            <h3 className={styles.detailName}>{active.name}</h3>
            <p className={styles.detailMeta}>
              {active.isBase
                ? 'Our workshop and base'
                : `About ${active.distanceKm} km from the workshop`}
            </p>
          </div>

          <Link
            href={`/contact?city=${encodeURIComponent(active.leadCity)}`}
            className={styles.detailCta}
          >
            Get a quote for {active.name} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </>
      )}
    </div>
  )
}

/**
 * Catches anything the terrain throws: a WebGL context the browser refuses, or
 * a chunk that fails to load after a redeploy. Without it the error travels up
 * to the page and takes the whole section down with it. With it, the terrain
 * quietly unmounts and the flat map, which never left, is what remains.
 */
class TerrainBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Where the terrain is in its life, written to the surface as `data-terrain`.
 *
 * `off` is the flat map alone. `loading` means the chunk is mounting over it
 * but has drawn nothing yet, so the flat map stays visible and clickable.
 * `ready` is the first drawn frame, and only then does the flat map fade out.
 * `failed` unmounts the terrain and leaves the flat map exactly as it was.
 *
 * The distinction between loading and ready is the fix. The flat map used to
 * fade the moment the chunk mounted, so a relief that failed to load left an
 * empty panel in its place.
 */
type TerrainState = 'off' | 'loading' | 'ready' | 'failed'

export function CoverageStage({ caption }: { caption: string }) {
  const surface = useRef<HTMLDivElement>(null)
  const armed = useTerrainGate(surface)
  const [progress, setProgress] = useState<'loading' | 'ready' | 'failed'>('loading')

  // Stable, so the terrain's effects do not re-run on every selection change.
  const onReady = useCallback(() => {
    setProgress(current => (current === 'failed' ? current : 'ready'))
  }, [])
  const onFail = useCallback(() => setProgress('failed'), [])

  const terrain: TerrainState = armed ? progress : 'off'

  return (
    <div className={styles.stage}>
      <div className={styles.surface} ref={surface} data-terrain={terrain}>
        <CoverageMapFlat />
        {(terrain === 'loading' || terrain === 'ready') && (
          <TerrainBoundary onFail={onFail}>
            <CoverageTerrain onReady={onReady} onFail={onFail} />
          </TerrainBoundary>
        )}
      </div>

      <p className={styles.caption}>
        {/*
          Only true while the terrain is on screen. Phones, reduced motion and
          any failed load all show the flat map, which draws no elevation at
          all, so the caption must not describe hills they cannot see.
        */}
        {terrain === 'ready' && 'Elevation from public terrain data, exaggerated about four times so the hills read. '}
        {caption}
      </p>

      <CoverageDetail />
    </div>
  )
}
