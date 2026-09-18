'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { COVERAGE_PLACES, type CoveragePlace } from '@/lib/coverage-places'

/**
 * Shared state for the coverage map.
 *
 * The place list sits in the page's copy column and the map sits in its figure
 * column, so the two live in different parts of each page's own grid. A
 * provider lets them share a selection without either page having to give up
 * the layout it already had.
 */

interface CoverageMapState {
  places: CoveragePlace[]
  /** The place whose detail is open, or null for the regional overview. */
  selected: CoveragePlace | null
  /** Pointer or keyboard focus, which previews without committing. */
  hovered: string | null
  /** The place the map should emphasise right now. */
  active: CoveragePlace | null
  select: (name: string | null) => void
  setHovered: (name: string | null) => void
}

const CoverageMapContext = createContext<CoverageMapState | null>(null)

export function CoverageMapProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const select = useCallback((name: string | null) => {
    // Tapping the open place again closes it, so the map can return to the
    // regional view without hunting for a close button.
    setSelected(current => (current === name ? null : name))
  }, [])

  const value = useMemo<CoverageMapState>(() => {
    const byName = (name: string | null) =>
      name ? COVERAGE_PLACES.find(place => place.name === name) ?? null : null
    const selectedPlace = byName(selected)

    return {
      places: COVERAGE_PLACES,
      selected: selectedPlace,
      hovered,
      active: byName(hovered) ?? selectedPlace,
      select,
      setHovered,
    }
  }, [selected, hovered, select])

  return <CoverageMapContext.Provider value={value}>{children}</CoverageMapContext.Provider>
}

export function useCoverageMap(): CoverageMapState {
  const context = useContext(CoverageMapContext)
  if (!context) throw new Error('useCoverageMap must be used inside a CoverageMapProvider')
  return context
}
