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

  // Focus close button on open
  useEffect(() => {
    closeRef.current?.focus()
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
    >
      {/* Close */}
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 p-2 text-white hover:text-ink-muted"
      >
        ✕
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-ink-muted text-2xl"
        >
          ←
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-4xl max-h-[80vh] w-full mx-16">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1200}
          height={800}
          className="object-contain max-h-[80vh] w-full"
          priority
        />
        <p id={captionId} className="mt-2 text-center text-sm text-ink-muted">{photo.alt}</p>
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:text-ink-muted text-2xl"
        >
          →
        </button>
      )}

      {/* Counter */}
      <p className="absolute bottom-4 text-xs text-ink-muted">
        {idx + 1} / {total}
      </p>
    </div>
  )
}
