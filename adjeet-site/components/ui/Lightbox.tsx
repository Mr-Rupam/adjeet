'use client'

import { useEffect, useState, useCallback, useRef, useId } from 'react'
import Image from 'next/image'

export interface LightboxPhoto {
  src: string
  alt: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(() =>
    Math.max(0, Math.min(initialIndex, photos.length - 1))
  )
  const total = photos.length
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const captionId = useId()

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  // Return keyboard users to the work they opened when the dialog unmounts.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard navigation + focus trap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') { next(); return }
      if (e.key === 'ArrowLeft') { prev(); return }

      if (e.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, next, prev])

  const photo = photos[idx]

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      aria-describedby={captionId}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-night/95 px-4 py-6 backdrop-blur-md"
    >
      {/* Close */}
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-night-rule bg-night/60 text-night-ink backdrop-blur-sm transition-colors hover:border-signal hover:text-signal focus-visible:outline-night-ink"
      >
        ✕
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-night-rule bg-night/60 text-lg text-night-ink backdrop-blur-sm transition-colors hover:border-signal hover:text-signal focus-visible:outline-night-ink"
        >
          ←
        </button>
      )}

      {/* Image */}
      <div className="relative flex w-[calc(100vw-2rem)] max-w-5xl flex-col items-center sm:w-[calc(100vw-8rem)]">
        <div className="flex max-h-[72dvh] w-full items-center justify-center overflow-hidden border border-night-rule bg-black/20 shadow-[0_24px_80px_rgb(0_0_0_/_35%)]">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={1200}
            height={800}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 8rem), 1024px"
            className="max-h-[72dvh] w-full object-contain"
            priority
          />
        </div>
        <p id={captionId} className="mt-3 max-w-[52ch] text-center text-sm text-night-ink-muted">{photo.alt}</p>
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-night-rule bg-night/60 text-lg text-night-ink backdrop-blur-sm transition-colors hover:border-signal hover:text-signal focus-visible:outline-night-ink"
        >
          →
        </button>
      )}

      {/* Counter */}
      <p className="absolute bottom-4 text-xs text-night-ink-muted">
        {idx + 1} / {total}
      </p>
    </div>
  )
}
