'use client'

import { useEffect, useState, useCallback, useRef, useId } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { projectWhatsAppUrl, type ProjectReference } from '@/lib/whatsapp'

export interface LightboxPhoto {
  src: string
  alt: string
  /**
   * The public reference of the photographed job, carried into the enquiry so
   * the workshop knows which example the buyer means. Without one, the action
   * falls back to the general enquiry.
   */
  reference?: ProjectReference
}

interface LightboxProps {
  photos: LightboxPhoto[]
  initialIndex: number
  onClose: () => void
}

/** Everything a keyboard user can reach inside the viewer, in DOM order. */
const FOCUSABLE = 'a[href], button:not([disabled])'

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

  // Scroll lock
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus()
    }
  }, [])

  // Keyboard navigation + focus trap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') { next(); return }
      if (e.key === 'ArrowLeft') { prev(); return }

      if (e.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const inside = dialogRef.current?.contains(document.activeElement) ?? false
        if (e.shiftKey) {
          if (document.activeElement === first || !inside) {
            e.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last || !inside) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, next, prev])

  const photo = photos[idx]
  const reference = photo.reference

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      aria-describedby={captionId}
      className="lightbox"
      data-photo-id={reference?.id}
    >
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" className="lightbox__control lightbox__close">
        <X size={22} aria-hidden="true" />
      </button>

      <figure className="lightbox__figure">
        <div className="lightbox__frame">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={1200}
            height={800}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 8rem), 1024px"
            className="lightbox__image"
            preload
          />
        </div>
        <figcaption className="lightbox__caption">
          <div className="lightbox__text">
            {reference && <p className="lightbox__client">{reference.client}<span>{reference.label}</span></p>}
            <p id={captionId} className="lightbox__alt">{photo.alt}</p>
          </div>
          <div className="lightbox__actions">
            {total > 1 && (
              <div className="lightbox__stepper">
                <button type="button" onClick={prev} aria-label="Previous photo" className="lightbox__control">
                  <ArrowLeft size={20} aria-hidden="true" />
                </button>
                <p className="lightbox__count" aria-live="polite">{idx + 1} / {total}</p>
                <button type="button" onClick={next} aria-label="Next photo" className="lightbox__control">
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              </div>
            )}
            <WhatsAppLink
              href={projectWhatsAppUrl(reference)}
              source={reference ? `photo-viewer:${reference.id}` : 'photo-viewer'}
              className="lightbox__ask"
            >
              <WhatsAppIcon />
              <span>Ask about a sign like this</span>
            </WhatsAppLink>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}
