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
})
