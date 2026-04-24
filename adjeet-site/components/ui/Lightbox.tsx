'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [idx, setIdx] = useState(initialIndex)
  const total = photos.length

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, next, prev])

  const photo = photos[idx]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
    >
      {/* Close */}
      <button
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
          className="absolute left-4 p-3 text-white hover:text-ink-muted text-2xl"
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
        <p className="mt-2 text-center text-sm text-ink-muted">{photo.alt}</p>
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-4 p-3 text-white hover:text-ink-muted text-2xl"
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
