'use client'

import Image, { type ImageProps } from 'next/image'
import { useState, type ImgHTMLAttributes } from 'react'

type SettledImage<Source> = { src: Source; status: 'loaded' | 'error' }

function useLoadingStatus<Source>(src: Source) {
  const [settled, setSettled] = useState<SettledImage<Source> | null>(null)
  return {
    status: settled?.src === src ? settled.status : 'loading',
    settle: (status: 'loaded' | 'error') => setSettled({ src, status }),
  }
}

/** Keep the shimmer tied to the actual image request, including source changes. */
export function LoadingImage({ src, alt, onLoad, onError, ...props }: ImageProps) {
  const { status, settle } = useLoadingStatus(src)

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      data-image-status={status}
      onLoad={event => {
        settle('loaded')
        onLoad?.(event)
      }}
      onError={event => {
        settle('error')
        onError?.(event)
      }}
    />
  )
}

type RawImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'> & { alt: string }

/**
 * A plain <img> with the same shimmer: the workshop frames (raw files, so they
 * match the transition films exactly) and the home hero's art-directed
 * <picture>. A preloaded image can finish before React hydrates and attaches
 * onLoad, so the image is also checked once it is mounted.
 */
export function LoadingRawImage({ src, alt, onLoad, onError, ...props }: RawImageProps) {
  const { status, settle } = useLoadingStatus(src)
  const settledBeforeHydration = (image: HTMLImageElement | null) => {
    if (status !== 'loading' || !image?.complete) return
    settle(image.naturalWidth > 0 ? 'loaded' : 'error')
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      ref={settledBeforeHydration}
      src={src}
      alt={alt}
      data-image-status={status}
      onLoad={event => {
        settle('loaded')
        onLoad?.(event)
      }}
      onError={event => {
        settle('error')
        onError?.(event)
      }}
    />
  )
}
