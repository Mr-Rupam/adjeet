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

/** Workshop frames remain raw files so they match the transition films exactly. */
export function LoadingRawImage({ src, alt, onLoad, onError, ...props }: RawImageProps) {
  const { status, settle } = useLoadingStatus(src)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
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
