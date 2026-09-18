import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { CoverageMapProvider } from '@/components/coverage/CoverageMapContext'
import { CoveragePlaceList } from '@/components/coverage/CoveragePlaceList'
import { CoverageStage } from '@/components/coverage/CoverageStage'
import { COVERAGE_PLACES } from '@/lib/coverage-places'

// Never reached on the narrow viewport below, but kept out of jsdom regardless.
vi.mock('@/components/coverage/CoverageTerrain', () => ({ CoverageTerrain: () => null }))

const INTRO = /rings mark/i

/** The list and the stage, sharing one provider, the way both pages compose them. */
function renderMap() {
  render(
    <CoverageMapProvider>
      <CoveragePlaceList />
      <CoverageStage caption="Coverage shown approximately." />
    </CoverageMapProvider>,
  )
  return within(screen.getByRole('list', { name: 'Areas we serve' }))
}

beforeEach(() => {
  // A phone-width viewport, so the flat map is all that ever mounts.
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CoveragePlaceList', () => {
  it('moves between places with the arrow keys, wrapping at both ends, and previews the focused place', () => {
    const list = renderMap()
    const buttons = list.getAllByRole('button')
    expect(buttons).toHaveLength(COVERAGE_PLACES.length)
    const first = buttons[0]
    const last = buttons[buttons.length - 1]

    act(() => first.focus())
    // The key is consumed, so the page does not scroll under the list as well.
    expect(fireEvent.keyDown(first, { key: 'ArrowDown' })).toBe(false)
    expect(buttons[1]).toHaveFocus()
    expect(screen.getByRole('heading', { level: 3, name: COVERAGE_PLACES[1].name })).toBeInTheDocument()

    fireEvent.keyDown(buttons[1], { key: 'ArrowRight' })
    expect(buttons[2]).toHaveFocus()
    fireEvent.keyDown(buttons[2], { key: 'ArrowLeft' })
    expect(buttons[1]).toHaveFocus()
    fireEvent.keyDown(buttons[1], { key: 'ArrowUp' })
    expect(first).toHaveFocus()

    // Past either end, focus comes round instead of falling out of the list.
    fireEvent.keyDown(first, { key: 'ArrowUp' })
    expect(last).toHaveFocus()
    fireEvent.keyDown(last, { key: 'ArrowDown' })
    expect(first).toHaveFocus()

    // Moving focus previews; it never commits a place.
    expect(list.queryAllByRole('button', { pressed: true })).toHaveLength(0)
  })

  it('opens one place at a time, closes it on a second press or Escape, and hands the right city to the form', () => {
    const list = renderMap()
    const coochBehar = list.getByRole('button', { name: /^Cooch Behar/ })
    const sikkim = list.getByRole('button', { name: /^Sikkim/ })
    expect(screen.getByText(INTRO)).toBeInTheDocument()

    fireEvent.click(coochBehar)
    expect(coochBehar).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 3, name: 'Cooch Behar' })).toBeInTheDocument()
    // A two word city arrives at the enquiry form as one intact value.
    expect(screen.getByRole('link', { name: /Get a quote for Cooch Behar/ }))
      .toHaveAttribute('href', '/contact?city=Cooch%20Behar')

    // Choosing another place moves the selection rather than adding to it.
    fireEvent.click(sikkim)
    expect(list.getAllByRole('button', { pressed: true })).toEqual([sikkim])
    // Sikkim has no option of its own on the form, so it is sent as Gangtok.
    expect(screen.getByRole('link', { name: /Get a quote for Sikkim/ }))
      .toHaveAttribute('href', '/contact?city=Gangtok')

    // Pressing the open place again returns to the regional view.
    fireEvent.click(sikkim)
    expect(sikkim).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(INTRO)).toBeInTheDocument()

    fireEvent.click(coochBehar)
    fireEvent.keyDown(coochBehar, { key: 'Escape' })
    expect(coochBehar).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(INTRO)).toBeInTheDocument()
  })

  it('previews a place under the pointer without losing the one that is open', () => {
    const list = renderMap()
    const malda = list.getByRole('button', { name: /^Malda/ })
    const darjeeling = list.getByRole('button', { name: /^Darjeeling/ })

    fireEvent.click(malda)
    fireEvent.pointerEnter(darjeeling)
    expect(screen.getByRole('heading', { level: 3, name: 'Darjeeling' })).toBeInTheDocument()
    expect(malda).toHaveAttribute('aria-pressed', 'true')
    expect(darjeeling).toHaveAttribute('aria-pressed', 'false')

    fireEvent.pointerLeave(darjeeling)
    expect(screen.getByRole('heading', { level: 3, name: 'Malda' })).toBeInTheDocument()
  })
})
