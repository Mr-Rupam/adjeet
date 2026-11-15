import { flushSync } from 'react-dom'
import type { ResolvedTheme } from '@/lib/theme'

/**
 * One theme change for the whole page, on one clock.
 *
 * Before 16 November 2026 the toggle wrote `data-theme` at once, so the page's
 * colours snapped while each day and night scene waited for its incoming
 * image to decode and then faded on its own 700ms CSS clock. Going from dark
 * to light it was worse: the night layer is later in the DOM and its `z-index`
 * did nothing on an unpositioned <picture>, so it stayed painted over the day
 * layer that was fading in underneath, then dropped out in one step when its
 * delayed opacity change fired. The colours had changed by then, so the switch
 * arrived in two halves.
 *
 * Now every ThemeScene on screen first gets its incoming image decoded, and
 * only then does anything change: the root theme and every scene are switched
 * in the same frame, inside a view transition, which cross-fades the whole
 * page from its old look to its new one over one duration and one easing
 * (app/globals.css). The new look is drawn over the old one at full opacity
 * underneath, so the ground never shows through. While it runs, the page's
 * own CSS transitions are off (`data-theme-switching`), so nothing runs on a
 * second clock. Without view transitions (or with reduced motion) the same
 * single change happens at once, and the scenes' own cross-fade covers it.
 */

export type ThemeSceneHandle = {
  /** Lay the incoming scene out and decode it. Resolves when it can be shown. */
  prepare: (theme: ResolvedTheme) => Promise<void>
  /** Show the scene for `theme`, synchronously. */
  commit: (theme: ResolvedTheme) => void
  /** True while the scene is on or near the screen; only those hold the switch. */
  near: () => boolean
}

const scenes = new Set<ThemeSceneHandle>()

export function registerThemeScene(handle: ThemeSceneHandle) {
  scenes.add(handle)
  return () => { scenes.delete(handle) }
}

/** The longest the page waits for an incoming scene before switching anyway. */
export const SCENE_DECODE_LIMIT_MS = 5000

let pending = 0

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

/**
 * Switch the page to `theme`. `apply` writes the root theme (and anything that
 * must change with it); it runs once, in the same frame as every scene.
 */
export async function switchTheme(theme: ResolvedTheme, apply: () => void) {
  const mine = ++pending
  const near = [...scenes].filter(scene => scene.near())
  await Promise.race([
    Promise.all(near.map(scene => scene.prepare(theme).catch(() => undefined))),
    new Promise(resolve => setTimeout(resolve, SCENE_DECODE_LIMIT_MS)),
  ])
  // A second click while waiting wins: only the latest switch is applied.
  if (mine !== pending) return

  const update = () => {
    flushSync(() => {
      apply()
      scenes.forEach(scene => scene.commit(theme))
    })
  }

  const doc = document as ViewTransitionDocument
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof doc.startViewTransition !== 'function') {
    update()
    return
  }

  const root = document.documentElement
  root.setAttribute('data-theme-switching', '')
  try {
    const transition = doc.startViewTransition(update)
    await transition.finished.catch(() => undefined)
  } finally {
    if (mine === pending) root.removeAttribute('data-theme-switching')
  }
}
