'use client'

import { useRef } from 'react'
import { useCoverageMap } from './CoverageMapContext'
import styles from './CoverageMap.module.css'

/**
 * The accessible control surface for the map.
 *
 * The SVG and the terrain are both `aria-hidden`, so this list is how the map
 * is operated without a pointer. It replaces the static list of area names that
 * used to sit in the same spot, which means the page gains the interaction
 * without gaining a second copy of the coverage claim.
 *
 * Every row says the same kind of thing: a place, and how far it is from the
 * workshop. The earlier version showed a project count per place, which turned
 * the list into a ranking of where we have most to show rather than a statement
 * of where we go.
 *
 * Arrow keys move between places the way a toolbar does, rather than making a
 * keyboard user tab through eleven stops to reach the last one.
 */
export function CoveragePlaceList() {
  const { places, active, selected, select, setHovered } = useCoverageMap()
  const listRef = useRef<HTMLUListElement>(null)

  const move = (from: number, delta: number) => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-place]')
    if (!buttons?.length) return
    const next = (from + delta + buttons.length) % buttons.length
    buttons[next].focus()
  }

  return (
    <ul className={styles.placeList} aria-label="Areas we serve" ref={listRef}>
      {places.map((place, index) => {
        const isActive = active?.name === place.name

        return (
          <li key={place.name}>
            <button
              type="button"
              data-place={place.name}
              className={[styles.placeButton, isActive ? styles.placeButtonActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={selected?.name === place.name}
              onClick={() => select(place.name)}
              onPointerEnter={() => setHovered(place.name)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(place.name)}
              onBlur={() => setHovered(null)}
              onKeyDown={event => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                  event.preventDefault()
                  move(index, 1)
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                  event.preventDefault()
                  move(index, -1)
                } else if (event.key === 'Escape') {
                  select(null)
                }
              }}
            >
              <span className={styles.placeName}>{place.name}</span>
              {place.isBase ? (
                <span className={styles.placeTag}>Workshop</span>
              ) : (
                <span className={styles.placeDistance}>{place.distanceKm} km</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
