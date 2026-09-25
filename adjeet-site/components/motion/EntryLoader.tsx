'use client'

import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { useEffect, useRef, type CSSProperties } from 'react'
import { ENTRY_INTRO_COMPLETE_EVENT, ENTRY_INTRO_DURATION_MS } from '@/lib/entry-intro'
import styles from './EntryLoader.module.css'

/** A first-entry workshop shutter: the real wordmark is the only brand artwork. */
export function EntryLoader() {
  const skipRef = useRef<HTMLButtonElement>(null)
  const finishRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const html = document.documentElement
    if (html.dataset.entryIntro !== 'playing') return

    let finished = false
    const release = () => {
      if (finished) return
      finished = true
      html.removeAttribute('data-entry-intro')
      html.removeAttribute('data-entry-intro-started-at')
      if (document.activeElement === skipRef.current) {
        document.getElementById('main-content')?.focus({ preventScroll: true })
      }
      window.dispatchEvent(new Event(ENTRY_INTRO_COMPLETE_EVENT))
    }
    finishRef.current = release
    const onKeyDown = (event: KeyboardEvent) => {
      if (finished || html.dataset.entryIntro !== 'playing') return
      if (event.key === 'Escape') release()
      if (event.key === 'Tab') {
        event.preventDefault()
        skipRef.current?.focus({ preventScroll: true })
      }
    }
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => {
      if (motionPreference.matches) release()
    }

    const startedAt = Number(html.dataset.entryIntroStartedAt ?? 0)
    const elapsed = startedAt ? Date.now() - startedAt : 0
    if (motionPreference.matches || elapsed >= ENTRY_INTRO_DURATION_MS) {
      release()
      return
    }
    skipRef.current?.focus({ preventScroll: true })
    window.addEventListener('keydown', onKeyDown)
    motionPreference.addEventListener('change', onMotionChange)
    const timer = window.setTimeout(release, ENTRY_INTRO_DURATION_MS - elapsed)
    return () => {
      finishRef.current = null
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
      motionPreference.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div
      className={styles.intro}
      role="dialog"
      aria-modal="true"
      aria-label="AD JEET opening animation"
      data-entry-loader
      style={{ '--entry-intro-duration': `${ENTRY_INTRO_DURATION_MS}ms` } as CSSProperties}
    >
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.drafting} aria-hidden="true" />

      <div className={styles.logoStage}>
        <div className={styles.logoLight} aria-hidden="true" />
        <Image
          src="/brand/adjeet-original.png"
          alt="AD JEET, since 1990"
          width={586}
          height={175}
          priority
          className={styles.logo}
        />
        <div className={styles.logoCaption} aria-hidden="true">
          <span>SIGNAGE / OUTDOOR</span>
          <span>SILIGURI · NORTH BENGAL</span>
        </div>
      </div>

      <div className={`${styles.shutter} ${styles.shutterTop}`} aria-hidden="true" />
      <div className={`${styles.shutter} ${styles.shutterBottom}`} aria-hidden="true" />
      <div className={styles.cutLine} aria-hidden="true" />
      <div className={styles.cutSpark} aria-hidden="true" />

      <button className={styles.skip} ref={skipRef} type="button" onClick={() => finishRef.current?.()}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>
      <span className={styles.footerNote} aria-hidden="true">SILIGURI · EST. 1990</span>
    </div>
  )
}
