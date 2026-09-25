'use client'

import { COVERAGE_BORDERS, projectFlat } from '@/content/coverage-geometry'
import { BOARD_LIFT, REACH_RINGS_KM, type CoveragePlace } from '@/lib/coverage-places'
import { useCoverageMap } from './CoverageMapContext'
import styles from './CoverageMap.module.css'

/**
 * The flat map. Always rendered, never optional.
 *
 * This is the layer that has to work everywhere: no WebGL, no JS beyond React,
 * a 320px phone, reduced motion. The terrain draws on top of it when a device
 * can take it, but nothing is ever available only in 3D.
 *
 * The SVG itself is `aria-hidden`. Every place it draws is also a real button
 * in `CoveragePlaceList`, so a screen reader gets the same information through
 * ordinary markup instead of through a pile of ARIA on SVG nodes.
 */

/** Cropped to where the places actually are, rather than the full generated frame. */
const VIEW = { x: 200, y: 88, width: 570, height: 752 }

/**
 * How far past the viewBox the land and the clip extend.
 *
 * The SVG letterboxes inside its surface, and painting only the viewBox left
 * bands of bare panel down either side. Bleeding the land out means the map
 * fills the frame at any aspect ratio.
 */
const BLEED = 420

const BASE = projectFlat(88.3953, 26.7271)

/**
 * ViewBox units per kilometre, along each axis.
 *
 * The projection is a plain linear one, so a kilometre of longitude and a
 * kilometre of latitude are not quite the same number of units at this
 * latitude. The reach rings are drawn as ellipses with both, rather than as
 * circles with an average, so a ring labelled 100km is 100km in any direction.
 */
const UNITS_PER_KM_X = 220 / (111.32 * Math.cos((26.7271 * Math.PI) / 180))
const UNITS_PER_KM_Y = 250 / 110.57

/** Neighbours, for orientation. Positioned by hand to sit inside their own territory. */
const CONTEXT = [
  { label: 'NEPAL', x: 243, y: 300 },
  { label: 'BHUTAN', x: 652, y: 205 },
  { label: 'BANGLADESH', x: 606, y: 620 },
  { label: 'BIHAR', x: 240, y: 560 },
]

// Compact wayfinding marks fit the printed boards at phone scale. The place
// list and the selected detail below the map carry each full name.
const BOARD_CODES: Record<string, string> = {
  Siliguri: 'SL',
  Darjeeling: 'DJ',
  Jalpaiguri: 'JP',
  'Cooch Behar': 'CB',
  Alipurduar: 'AL',
  Kalimpong: 'KL',
  Malda: 'ML',
  'North Dinajpur': 'ND',
  'South Dinajpur': 'SD',
  'The Dooars': 'DR',
  Sikkim: 'SK',
}

function Signboard({ place }: { place: CoveragePlace }) {
  const { active, select, setHovered } = useCoverageMap()
  const { x, y } = projectFlat(place.lon, place.lat)

  const isActive = active?.name === place.name
  // Full place names cannot fit these small boards, especially on phones.
  // The detail below the map displays the selected name at reading size.
  const width = place.isBase ? 54 : 40
  const height = place.isBase ? 28 : 22
  // Overlap is far milder looking straight down than it is in the terrain's
  // perspective view, where billboarded signs at different depths stack up. The
  // shared rule is tuned for 3D, so the flat map takes a fraction of it: enough
  // to separate a pair, not enough to push a board off the top of the frame.
  const post = (place.isBase ? 34 : 26) + (BOARD_LIFT[place.name] ?? 0) * height * 0.45
  const legs = [-width * 0.28, width * 0.28]
  const top = -post - height

  const className = [
    styles.board,
    place.isBase ? styles.boardBase : styles.boardCovered,
    isActive ? styles.boardActive : '',
  ].filter(Boolean).join(' ')

  return (
    <g
      className={className}
      data-map-place={place.name}
      transform={`translate(${x} ${y})`}
      onPointerEnter={() => setHovered(place.name)}
      onPointerLeave={() => setHovered(null)}
      onClick={() => select(place.name)}
    >
      {/* A generous invisible target, so a fingertip does not have to find a 20px board. */}
      <rect className={styles.boardHit} x={-width / 2 - 6} y={top - 10} width={width + 12} height={post + height + 24} />

      {/* The patch of ground the hoarding stands on. */}
      <ellipse className={styles.boardShadow} cx={0} cy={2} rx={width * 0.44} ry={3.6} />

      {legs.map(offset => (
        <line key={offset} className={styles.leg} x1={offset} y1={0} x2={offset} y2={-post} />
      ))}
      <rect className={styles.footing} x={-width * 0.36} y={-2.5} width={width * 0.72} height={3.4} rx={1} />

      {/* Frame, face and keyline: the three parts of a printed board. */}
      <g className={styles.boardPlate}>
        <rect className={styles.boardFrame} x={-width / 2 - 2.2} y={top - 2.2} width={width + 4.4} height={height + 4.4} rx={1.5} />
        <rect className={styles.boardFace} data-board-face x={-width / 2} y={top} width={width} height={height} rx={0.5} />
        <rect className={styles.boardKeyline} x={-width / 2 + 3.5} y={top + 3.5} width={width - 7} height={height - 7} rx={0.5} />
        <text className={styles.boardLabel} x={0} y={top + height / 2} textAnchor="middle" dominantBaseline="central">
          {BOARD_CODES[place.name] ?? place.name.slice(0, 2).toUpperCase()}
        </text>
      </g>
    </g>
  )
}

export function CoverageMapFlat() {
  const { places, active } = useCoverageMap()

  return (
    <svg
      className={styles.flat}
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="coverage-reach">
          <stop offset="0%" stopColor="var(--map-reach)" stopOpacity="0.2" />
          <stop offset="42%" stopColor="var(--map-reach)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--map-reach)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="coverage-frame">
          <rect
            x={VIEW.x - BLEED}
            y={VIEW.y - BLEED}
            width={VIEW.width + BLEED * 2}
            height={VIEW.height + BLEED * 2}
          />
        </clipPath>
      </defs>

      <g clipPath="url(#coverage-frame)">
        <rect
          className={styles.land}
          x={VIEW.x - BLEED}
          y={VIEW.y - BLEED}
          width={VIEW.width + BLEED * 2}
          height={VIEW.height + BLEED * 2}
        />

        <ellipse
          className={styles.reachWash}
          cx={BASE.x}
          cy={BASE.y}
          rx={REACH_RINGS_KM[REACH_RINGS_KM.length - 1] * UNITS_PER_KM_X}
          ry={REACH_RINGS_KM[REACH_RINGS_KM.length - 1] * UNITS_PER_KM_Y}
          fill="url(#coverage-reach)"
        />

        {COVERAGE_BORDERS.map(border => (
          <path key={border.name} className={styles.border} d={border.d} />
        ))}

        {/*
          Reach rings, measured from the workshop and labelled.
          Without them the map was a scatter of poles with no sense of how far
          the vans actually travel, which is the one thing a coverage map is for.
        */}
        {REACH_RINGS_KM.map(km => (
          <g key={km} className={styles.reachRing}>
            <ellipse cx={BASE.x} cy={BASE.y} rx={km * UNITS_PER_KM_X} ry={km * UNITS_PER_KM_Y} />
            <text x={BASE.x} y={BASE.y + km * UNITS_PER_KM_Y - 5} textAnchor="middle">
              {km} km
            </text>
          </g>
        ))}

        {CONTEXT.map(item => (
          <text key={item.label} className={styles.context} x={item.x} y={item.y}>
            {item.label}
          </text>
        ))}

        {/* The route from the workshop to whatever is under the cursor. */}
        {active && !active.isBase && (
          <line
            className={styles.route}
            x1={BASE.x}
            y1={BASE.y}
            x2={projectFlat(active.lon, active.lat).x}
            y2={projectFlat(active.lon, active.lat).y}
          />
        )}

        {/* Drawn north first, so southern boards stack in front of the ones behind. */}
        {[...places]
          .sort((a, b) => b.lat - a.lat)
          .map(place => <Signboard key={place.name} place={place} />)}
      </g>
    </svg>
  )
}
