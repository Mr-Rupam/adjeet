'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ContactMap.module.css'

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

/**
 * The workshop map, without Google's 450 KB until someone wants it.
 *
 * The page first shows a plain block: the address, a link to the listing and a
 * "Show map" button. The embed mounts when that button is pressed, or when the
 * block is on screen once the page has finished loading and gone idle. Nothing
 * is requested from Google before either.
 */
export function ContactMap({ embedUrl, mapsUrl, title, address }: {
  embedUrl: string
  mapsUrl: string
  title: string
  address: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [shown, setShown] = useState<'no' | 'auto' | 'asked'>('no')

  useEffect(() => {
    if (shown !== 'no') return
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const idleWindow = window as IdleWindow
    let observer: IntersectionObserver | null = null
    let idleHandle = 0
    let timer = 0

    const watch = () => {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) setShown('auto')
      })
      observer.observe(node)
    }
    const afterLoad = () => {
      if (idleWindow.requestIdleCallback) idleHandle = idleWindow.requestIdleCallback(watch, { timeout: 3000 })
      else timer = window.setTimeout(watch, 1500)
    }

    if (document.readyState === 'complete') afterLoad()
    else window.addEventListener('load', afterLoad, { once: true })
    return () => {
      window.removeEventListener('load', afterLoad)
      if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle)
      if (timer) window.clearTimeout(timer)
      observer?.disconnect()
    }
  }, [shown])

  // The button that was pressed is gone, so hand focus to the map it opened.
  useEffect(() => {
    if (shown === 'asked') frameRef.current?.focus()
  }, [shown])

  return (
    <div className="contact-map" ref={ref}>
      {shown === 'no' ? (
        <div className={styles.placeholder}>
          <p className="spec">Workshop map</p>
          <p className={styles.address}>{address}</p>
          <div className={styles.actions}>
            <button type="button" className={`button-shape spec ${styles.show}`} onClick={() => setShown('asked')}>
              Show map
            </button>
            <a className={styles.open} href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Open in Google Maps ↗
            </a>
          </div>
        </div>
      ) : (
        <iframe
          ref={frameRef}
          src={embedUrl}
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  )
}
