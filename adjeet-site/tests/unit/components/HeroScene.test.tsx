import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HeroScene } from '@/components/home/HeroScene'

describe('HeroScene', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    })
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
<<<<<<< HEAD
=======
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
>>>>>>> origin/main
  })

  afterEach(() => vi.restoreAllMocks())

  it('keeps the matched workshop scene in one hero while the global theme changes', async () => {
    render(<HeroScene />)

    const scene = screen.getByTestId('hero-scene')
    expect(scene).toHaveAttribute('data-time', 'light')
    expect(screen.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'true')
    expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'false')

    const sources = screen.getAllByTestId('hero-background-image').map(image => image.getAttribute('src'))
    expect(sources).toEqual([
      '/hero/workshop/day.webp',
      '/hero/workshop/night.webp',
    ])
<<<<<<< HEAD
=======
    expect(screen.getByTestId('hero-day-to-night-video')).toHaveAttribute('preload', 'none')
    expect(screen.getByTestId('hero-night-to-day-video')).toHaveAttribute('preload', 'none')
>>>>>>> origin/main

    document.documentElement.setAttribute('data-theme', 'dark')

    await waitFor(() => {
      expect(scene).toHaveAttribute('data-time', 'dark')
      expect(screen.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'false')
      expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true')
    })
  })

  it('plays the supplied day-to-night film when the visitor switches to dark mode', async () => {
    render(<HeroScene />)

    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
    })

    const scene = screen.getByTestId('hero-scene')
    await waitFor(() => expect(scene).toHaveAttribute('data-transition', 'day-to-night'))

    const film = screen.getByTestId('hero-day-to-night-video') as HTMLVideoElement
    expect(film).toHaveAttribute('src', '/hero/workshop/day-to-night.mp4')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
<<<<<<< HEAD
=======
    expect(film).toHaveAttribute('preload', 'none')
>>>>>>> origin/main
    expect(screen.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'true')
    expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'false')
    expect(film).toHaveAttribute('data-visible', 'false')

    fireEvent.playing(film)
    await waitFor(() => expect(film).toHaveAttribute('data-visible', 'true'))

    fireEvent.ended(film)
    await waitFor(() => {
      expect(scene).toHaveAttribute('data-transition', 'idle')
      expect(screen.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'false')
      expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true')
    })
  })
<<<<<<< HEAD
=======

  it('keeps the target poster visible when the requested film cannot play', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Playback denied'))
    render(<HeroScene />)

    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
    })

    await waitFor(() => {
      expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
      expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true')
    })
    expect(screen.getByTestId('hero-day-to-night-video')).toHaveAttribute('data-visible', 'false')
  })

  it('returns to the target poster when playback never starts', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(() => new Promise<void>(() => undefined))
      render(<HeroScene />)
      await act(async () => {
        document.documentElement.setAttribute('data-theme', 'dark')
        window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
      })
      expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'day-to-night')
      await act(async () => { vi.advanceTimersByTime(4000) })

      expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
      expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true')
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('abandons a stalled film and leaves the latest theme frame in place during a rapid toggle', async () => {
    render(<HeroScene />)

    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
      document.documentElement.setAttribute('data-theme', 'light')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'light' }))
    })

    const nightToDay = screen.getByTestId('hero-night-to-day-video')
    fireEvent.stalled(nightToDay)

    await waitFor(() => {
      expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
      expect(screen.getByTestId('hero-day-layer')).toHaveAttribute('data-visible', 'true')
      expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'false')
    })
  })

  it('does not start a theme film when reduced motion is requested', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    })
    render(<HeroScene />)

    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
    })

    await waitFor(() => expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-time', 'dark'))
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
    expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
  })

  it('ignores a late playback rejection after toggling back to the same direction', async () => {
    let rejectFirst: (reason: Error) => void = () => undefined
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectFirst = reject }))
    render(<HeroScene />)

    act(() => {
      for (const theme of ['dark', 'light', 'dark']) {
        document.documentElement.setAttribute('data-theme', theme)
        window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: theme }))
      }
    })
    await act(async () => { rejectFirst(new Error('Superseded playback')) })

    expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'day-to-night')
    fireEvent.playing(screen.getByTestId('hero-day-to-night-video'))
    expect(screen.getByTestId('hero-day-to-night-video')).toHaveAttribute('data-visible', 'true')
  })

  it('stops an active film when reduced motion is enabled', async () => {
    const listeners: Array<(event: { matches: boolean }) => void> = []
    const media = { matches: false, addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => listeners.push(listener), removeEventListener: vi.fn() }
    vi.mocked(window.matchMedia).mockImplementation(() => media as unknown as MediaQueryList)
    render(<HeroScene />)
    act(() => {
      document.documentElement.setAttribute('data-theme', 'dark')
      window.dispatchEvent(new CustomEvent('adjeet:theme-toggle', { detail: 'dark' }))
    })
    fireEvent.playing(screen.getByTestId('hero-day-to-night-video'))
    act(() => {
      media.matches = true
      listeners.forEach(listener => listener({ matches: true }))
    })
    await waitFor(() => expect(screen.getByTestId('hero-night-layer')).toHaveAttribute('data-visible', 'true'))
    expect(screen.getByTestId('hero-scene')).toHaveAttribute('data-transition', 'idle')
    expect(screen.getByTestId('hero-day-to-night-video')).toHaveAttribute('data-visible', 'false')
  })
>>>>>>> origin/main
})
