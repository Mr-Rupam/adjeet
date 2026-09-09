'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const runTokenRef = useRef(0)
  const startupTimerRef = useRef<number | null>(null)

  const clearStartupTimer = useCallback(() => {
    if (startupTimerRef.current === null) return
    window.clearTimeout(startupTimerRef.current)
    startupTimerRef.current = null
  }, [])

  const resetFilms = useCallback(() => {
    for (const film of [dayToNightRef.current, nightToDayRef.current]) {
      if (!film) continue
      film.pause()
      try {
        film.currentTime = 0
      } catch {
        // Metadata can still be unavailable while a visitor changes theme.
      }
    }
  }, [])

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
    clearStartupTimer()
    setFilmVisible(true)
  }, [clearStartupTimer])

  const finishFilm = useCallback((direction: ThemeTransition, runToken?: number) => {
    if (runToken !== undefined && runToken !== runTokenRef.current) return
    if (activeDirectionRef.current !== direction) return
    clearStartupTimer()
    activeDirectionRef.current = null
    setFilmVisible(false)
    setTransition(null)
  }, [clearStartupTimer])

  const failFilm = useCallback((direction: ThemeTransition, runToken?: number) => {
    if (runToken !== undefined && runToken !== runTokenRef.current) return
    if (activeDirectionRef.current !== direction) return
    const film = direction === 'day-to-night' ? dayToNightRef.current : nightToDayRef.current
    film?.pause()
    finishFilm(direction, runToken)
  }, [finishFilm])

  const cancelFilm = useCallback(() => {
    runTokenRef.current += 1
    clearStartupTimer()
    activeDirectionRef.current = null
    resetFilms()
    setFilmVisible(false)
    setTransition(null)
  }, [clearStartupTimer, resetFilms])

  useLayoutEffect(() => {
    const playThemeTransition = (event: Event) => {
      const nextTheme = (event as CustomEvent<unknown>).detail
      if (!isResolvedTheme(nextTheme)) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const direction: ThemeTransition = nextTheme === 'dark' ? 'day-to-night' : 'night-to-day'
      clearStartupTimer()
      const runToken = runTokenRef.current + 1
      runTokenRef.current = runToken
      resetFilms()

      const film = direction === 'day-to-night' ? dayToNightRef.current : nightToDayRef.current
      if (!film) return

      activeDirectionRef.current = direction
      setFilmVisible(false)
      setTransition(direction)
      startupTimerRef.current = window.setTimeout(() => failFilm(direction, runToken), 4000)
      void film.play().catch(() => failFilm(direction, runToken))
    }

    window.addEventListener(THEME_TOGGLE_EVENT, playThemeTransition)
    return () => window.removeEventListener(THEME_TOGGLE_EVENT, playThemeTransition)
  }, [clearStartupTimer, failFilm, resetFilms])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) cancelFilm()
    }
    mediaQuery.addEventListener('change', handlePreferenceChange)
    return () => {
      mediaQuery.removeEventListener('change', handlePreferenceChange)
      runTokenRef.current += 1
      clearStartupTimer()
      activeDirectionRef.current = null
      resetFilms()
    }
  }, [cancelFilm, clearStartupTimer, resetFilms])

  return (
    <div
      className="heroScene"
      data-hero-scene
      data-hero-media
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
        poster="/hero/workshop/day.webp"
        muted
        playsInline
        preload="none"
        onPlaying={() => revealFilm('day-to-night')}
        onEnded={() => finishFilm('day-to-night')}
        onError={() => failFilm('day-to-night')}
        onStalled={() => failFilm('day-to-night')}
      />
      <video
        ref={nightToDayRef}
        className="heroSceneVideo"
        data-testid="hero-night-to-day-video"
        data-visible={filmVisible && transition === 'night-to-day'}
        src="/hero/workshop/night-to-day.mp4"
        poster="/hero/workshop/night.webp"
        muted
        playsInline
        preload="none"
        onPlaying={() => revealFilm('night-to-day')}
        onEnded={() => finishFilm('night-to-day')}
        onError={() => failFilm('night-to-day')}
        onStalled={() => failFilm('night-to-day')}
      />
    </div>
  )
}
