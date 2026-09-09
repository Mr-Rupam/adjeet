'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { THEME_TOGGLE_EVENT, type ResolvedTheme } from '@/lib/theme'
import { useTheme } from '@/lib/use-theme'

type ThemeTransition = 'day-to-night' | 'night-to-day'

function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === 'light' || value === 'dark'
}

/**
 * The static hero states are the first decoded frames of the owner's two
 * workshop films. A visitor-initiated theme change plays the supplied film in
 * the matching direction, then hands back to the matching static frame.
 */
export function HeroScene() {
  const theme = useTheme()
  const [transition, setTransition] = useState<ThemeTransition | null>(null)
  const [filmVisible, setFilmVisible] = useState(false)
  const dayToNightRef = useRef<HTMLVideoElement>(null)
  const nightToDayRef = useRef<HTMLVideoElement>(null)
  const activeDirectionRef = useRef<ThemeTransition | null>(null)

  // During the few milliseconds before the film can paint a frame, retain the
  // matching source frame below it. This keeps the media surface full-bleed and
  // makes the handoff feel like one continuous scene.
  const staticTheme: ResolvedTheme = transition === 'day-to-night'
    ? 'light'
    : transition === 'night-to-day'
      ? 'dark'
      : theme

  const revealFilm = useCallback((direction: ThemeTransition) => {
    if (activeDirectionRef.current !== direction) return
    setFilmVisible(true)
  }, [])

  const finishFilm = useCallback((direction: ThemeTransition) => {
    if (activeDirectionRef.current !== direction) return
    activeDirectionRef.current = null
    setFilmVisible(false)
    setTransition(null)
  }, [])

  useLayoutEffect(() => {
    const playThemeTransition = (event: Event) => {
      const nextTheme = (event as CustomEvent<unknown>).detail
      if (!isResolvedTheme(nextTheme)) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const direction: ThemeTransition = nextTheme === 'dark' ? 'day-to-night' : 'night-to-day'
      const videos = [dayToNightRef.current, nightToDayRef.current]
      for (const candidate of videos) {
        if (!candidate) continue
        if (!candidate.paused) candidate.pause()
        candidate.currentTime = 0
      }

      const film = direction === 'day-to-night' ? dayToNightRef.current : nightToDayRef.current
      if (!film) return

      activeDirectionRef.current = direction
      setFilmVisible(false)
      setTransition(direction)
      void film.play().catch(() => finishFilm(direction))
    }

    window.addEventListener(THEME_TOGGLE_EVENT, playThemeTransition)
    return () => window.removeEventListener(THEME_TOGGLE_EVENT, playThemeTransition)
  }, [finishFilm])

  return (
    <div
      className="heroScene"
      data-hero-scene
      data-testid="hero-scene"
      data-time={theme}
      data-transition={transition ?? 'idle'}
      aria-hidden="true"
    >
      <picture className="heroSceneLayer" data-testid="hero-day-layer" data-visible={staticTheme === 'light'}>
        {/* The raw frame stays tied directly to the supplied transition film. */}
        <img data-testid="hero-background-image" src="/hero/workshop/day.webp" alt="" width="1280" height="720" fetchPriority="high" />
      </picture>
      <picture className="heroSceneLayer" data-testid="hero-night-layer" data-visible={staticTheme === 'dark'}>
        <img data-testid="hero-background-image" src="/hero/workshop/night.webp" alt="" width="1280" height="720" />
      </picture>
      <video
        ref={dayToNightRef}
        className="heroSceneVideo"
        data-testid="hero-day-to-night-video"
        data-visible={filmVisible && transition === 'day-to-night'}
        src="/hero/workshop/day-to-night.mp4"
        muted
        playsInline
        preload="auto"
        onPlaying={() => revealFilm('day-to-night')}
        onEnded={() => finishFilm('day-to-night')}
      />
      <video
        ref={nightToDayRef}
        className="heroSceneVideo"
        data-testid="hero-night-to-day-video"
        data-visible={filmVisible && transition === 'night-to-day'}
        src="/hero/workshop/night-to-day.mp4"
        muted
        playsInline
        preload="auto"
        onPlaying={() => revealFilm('night-to-day')}
        onEnded={() => finishFilm('night-to-day')}
      />
    </div>
  )
}
