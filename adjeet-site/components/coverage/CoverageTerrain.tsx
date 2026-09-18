'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Billboard, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '@/lib/use-theme'
import { useCoverageMap } from './CoverageMapContext'
import {
  BOARD_LIFT,
  COVERAGE_PLACES,
  REACH_RINGS_KM,
  type CoveragePlace,
} from '@/lib/coverage-places'
import styles from './CoverageMap.module.css'

/**
 * The terrain layer: real North Bengal relief, with the coverage boards
 * standing on it.
 *
 * Elevation is the committed `north-bengal-relief.png`, a 256x256 grid encoded
 * in terrarium RGB, baked by `scripts/build-coverage-terrain.mjs`. Nothing here
 * reaches the network beyond this project's own origin, which is what keeps the
 * strict `connect-src 'self'` CSP intact.
 *
 * Only ever mounted by `CoverageStage`, behind its gate.
 */

const BOUNDS = { west: 87.0, east: 90.6, south: 24.0, north: 27.8 }

/** Plane size in scene units. One unit is roughly one kilometre on the ground. */
const WIDTH = 360
const DEPTH = 420

/** Grid resolution of the relief PNG. */
const GRID = 256

/**
 * True relief here is about 2.4 percent of the region's width, which reads as
 * completely flat in a perspective view. Four times vertical exaggeration is
 * ordinary cartographic practice, and the caption says so on the page.
 */
const EXAGGERATION = 4

const lonToX = (lon: number) => ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west) - 0.5) * WIDTH
const latToZ = (lat: number) => ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south) - 0.5) * DEPTH

const xToLon = (x: number) => BOUNDS.west + (x / WIDTH + 0.5) * (BOUNDS.east - BOUNDS.west)
const zToLat = (z: number) => BOUNDS.north - (z / DEPTH + 0.5) * (BOUNDS.north - BOUNDS.south)

/**
 * The plane is sized so one scene unit is almost exactly one kilometre on the
 * ground, which is what lets the reach rings be drawn as plain circles.
 */
const onPlane = (x: number, z: number) =>
  x >= -WIDTH / 2 && x <= WIDTH / 2 && z >= -DEPTH / 2 && z <= DEPTH / 2

interface Relief {
  /** Metres above sea level, row 0 at the northern edge. */
  metres: Float32Array
  geometry: THREE.BufferGeometry
}

/** Height in scene units at a longitude and latitude, bilinearly sampled. */
function heightAt(metres: Float32Array, lon: number, lat: number): number {
  const u = ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * (GRID - 1)
  const v = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * (GRID - 1)
  const x0 = Math.min(Math.max(Math.floor(u), 0), GRID - 2)
  const y0 = Math.min(Math.max(Math.floor(v), 0), GRID - 2)
  const fx = u - x0
  const fy = v - y0
  const at = (x: number, y: number) => metres[y * GRID + x]
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx
  return ((top * (1 - fy) + bottom * fy) / 1000) * EXAGGERATION
}

/**
 * Loads the relief and turns it into displaced geometry.
 *
 * Displacement happens once on the CPU rather than in a vertex shader, because
 * that lets `computeVertexNormals` light the hills correctly. A shader would
 * need neighbour sampling and a hand written normal just to get back to what
 * the standard material already does well.
 */
function useRelief(onFail: () => void): Relief | null {
  const [relief, setRelief] = useState<Relief | null>(null)

  useEffect(() => {
    let cancelled = false
    const image = new window.Image()

    // A missing or blocked relief used to leave a transparent canvas sitting
    // over a flat map that had already faded out: an empty panel. Say so, and
    // let the stage hand back to the flat map.
    image.onerror = () => {
      if (!cancelled) onFail()
    }

    // Assigned before `src`, so a cached image cannot complete before the
    // handler is attached and leave the terrain permanently empty.
    image.onload = () => {
      if (cancelled) return

      const canvas = document.createElement('canvas')
      canvas.width = GRID
      canvas.height = GRID
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        onFail()
        return
      }
      context.drawImage(image, 0, 0)
      const { data } = context.getImageData(0, 0, GRID, GRID)

      const metres = new Float32Array(GRID * GRID)
      for (let i = 0; i < GRID * GRID; i += 1) {
        const p = i * 4
        metres[i] = data[p] * 256 + data[p + 1] + data[p + 2] / 256 - 32768
      }

      // Bake the rotation so the plane already lies in XZ with north at -Z,
      // which keeps every lon/lat conversion in this file a straight mapping.
      const geometry = new THREE.PlaneGeometry(WIDTH, DEPTH, GRID - 1, GRID - 1)
      geometry.rotateX(-Math.PI / 2)

      const position = geometry.attributes.position as THREE.BufferAttribute
      for (let row = 0; row < GRID; row += 1) {
        for (let column = 0; column < GRID; column += 1) {
          const index = row * GRID + column
          position.setY(index, (metres[index] / 1000) * EXAGGERATION)
        }
      }
      position.needsUpdate = true
      geometry.computeVertexNormals()

      setRelief({ metres, geometry })
    }

    image.src = '/data/north-bengal-relief.png'

    return () => {
      cancelled = true
    }
  }, [onFail])

  return relief
}

interface Palette {
  /**
   * Elevation ramp, as [metres, colour] stops.
   *
   * A single flat colour turned the Himalaya into a white cut-out by day and an
   * unreadable black mass by night. Shading by height is what makes it read as
   * terrain: the Dooars plain, the ridge behind it and the snow line all
   * separate, in brand colours rather than the usual atlas green.
   */
  ramp: [number, string][]
  border: string
  /** Face of every covered place. Deliberately one colour for all of them. */
  covered: string
  /** Face of the workshop board. */
  base: string
  /** Lettering knocked out of a covered board. */
  coveredInk: string
  /** Lettering on the gold workshop board. */
  baseInk: string
  /** The reach rings drawn on the ground around the workshop. */
  reach: string
  /** Posts, footings and the frame the board is mounted in. */
  structure: string
  /** Colour of the patch a sign drops on the ground beneath it. */
  shadow: string
  /** Haze that dissolves the far edge of the plane instead of cutting it. */
  fog: string
  ambient: number
  sun: number
  emissive: number
}

const PALETTES: Record<'light' | 'dark', Palette> = {
  light: {
    ramp: [
      [0, '#CBD0B7'],
      [250, '#D8D1B8'],
      [900, '#CDC0A3'],
      [2200, '#B6A991'],
      [4200, '#CFC8BB'],
      [6500, '#F1ECE2'],
    ],
    border: '#8C8574',
    covered: '#0079A6',
    base: '#E9CF3F',
    coveredInk: '#FFFFFF',
    baseInk: '#172229',
    reach: '#0099D0',
    structure: '#5F5C52',
    shadow: '#4A4636',
    fog: '#EFE6D3',
    ambient: 0.85,
    sun: 1.25,
    emissive: 0,
  },
  dark: {
    ramp: [
      [0, '#132029'],
      [250, '#16262E'],
      [900, '#1B3039'],
      [2200, '#234049'],
      [4200, '#2E535F'],
      [6500, '#436F7D'],
    ],
    border: '#3A4A52',
    covered: '#4FB6DE',
    base: '#E8D548',
    coveredInk: '#06222E',
    baseInk: '#0D1B24',
    reach: '#5CC6EC',
    structure: '#46555D',
    shadow: '#05090C',
    fog: '#101B21',
    ambient: 0.4,
    sun: 0.75,
    // At night the boards are the light source, which is the whole point of a
    // signage company's map after dark.
    emissive: 1,
  },
}

/** How far below sea level the sides of the model are cut. */
const SKIRT_DEPTH = 90

/**
 * The sides of the model, dropped from the terrain edge down to a flat base.
 *
 * Without this the relief is a displaced plane one polygon thick, so the moment
 * the camera moves off dead centre it reads as a square sheet of paper with
 * empty space behind it. Walling the edges in turns it into a solid block, the
 * way a physical relief model sits on a table.
 */
function buildSkirt(metres: Float32Array): THREE.BufferGeometry {
  const stepX = WIDTH / (GRID - 1)
  const stepZ = DEPTH / (GRID - 1)
  const at = (row: number, column: number) => ({
    x: -WIDTH / 2 + column * stepX,
    y: (metres[row * GRID + column] / 1000) * EXAGGERATION,
    z: -DEPTH / 2 + row * stepZ,
  })

  // Walk the perimeter once, in order, so consecutive points are neighbours.
  const rim: { x: number; y: number; z: number }[] = []
  for (let column = 0; column < GRID; column += 1) rim.push(at(0, column))
  for (let row = 1; row < GRID; row += 1) rim.push(at(row, GRID - 1))
  for (let column = GRID - 2; column >= 0; column -= 1) rim.push(at(GRID - 1, column))
  for (let row = GRID - 2; row >= 1; row -= 1) rim.push(at(row, 0))
  rim.push(rim[0])

  const positions: number[] = []
  for (let i = 0; i < rim.length - 1; i += 1) {
    const a = rim[i]
    const b = rim[i + 1]
    positions.push(
      a.x, a.y, a.z, b.x, -SKIRT_DEPTH, b.z, b.x, b.y, b.z,
      a.x, a.y, a.z, a.x, -SKIRT_DEPTH, a.z, b.x, -SKIRT_DEPTH, b.z,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

/** Colour for an elevation, linearly interpolated between the ramp stops. */
type RampStop = readonly [metres: number, colour: THREE.Color]

/**
 * Colour for an elevation, linearly interpolated between the ramp stops.
 *
 * Takes stops already parsed into colours. Parsing inside this function built
 * a fresh THREE.Color for all 65,536 vertices on every theme change.
 */
function sampleRamp(stops: readonly RampStop[], metres: number, into: THREE.Color): THREE.Color {
  if (metres <= stops[0][0]) return into.copy(stops[0][1])

  for (let i = 1; i < stops.length; i += 1) {
    const [high, highColour] = stops[i]
    if (metres <= high) {
      const [low, lowColour] = stops[i - 1]
      return into.copy(lowColour).lerp(highColour, (metres - low) / (high - low))
    }
  }

  return into.copy(stops[stops.length - 1][1])
}

/** The relief mesh, shaded by height in whichever theme is current. */
function TerrainSurface({ relief, palette }: { relief: Relief; palette: Palette }) {
  useEffect(() => {
    const count = relief.metres.length

    // Written in place on a theme change. Swapping in a new attribute each time
    // left the previous buffer for the GPU driver to reclaim whenever it chose.
    let attribute = relief.geometry.getAttribute('color') as THREE.BufferAttribute | undefined
    if (!attribute || attribute.count !== count) {
      attribute = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
      relief.geometry.setAttribute('color', attribute)
    }

    const stops: RampStop[] = palette.ramp.map(([metres, hex]) => [metres, new THREE.Color(hex)])
    const colours = attribute.array as Float32Array
    const colour = new THREE.Color()

    for (let i = 0; i < count; i += 1) {
      sampleRamp(stops, relief.metres[i], colour)
      colours[i * 3] = colour.r
      colours[i * 3 + 1] = colour.g
      colours[i * 3 + 2] = colour.b
    }
    attribute.needsUpdate = true
  }, [relief, palette])

  return (
    <mesh geometry={relief.geometry}>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  )
}

/**
 * The resolved heading stack, so text drawn into a canvas matches the page.
 *
 * `next/font` rewrites the family to a hashed name, so the literal "Barlow
 * Condensed" would silently fall back to sans-serif on the canvas. Reading the
 * computed value off a probe that uses the token gets the real stack.
 */
function headingFont(): string {
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;font-family:var(--font-heading)'
  document.body.appendChild(probe)
  const family = getComputedStyle(probe).fontFamily
  probe.remove()
  return family || 'sans-serif'
}

const SIGN_PX = { width: 768, height: 384 }

/**
 * Paints one sign face: the place name, on the board, inside its frame.
 *
 * This is the whole idea. The boards used to be blank colour swatches with the
 * name floating above in an HTML tooltip, which read as a map marker rather
 * than as signage. A sign maker's map should be covered in signs that say
 * something, so the name is printed on the board and the tooltip is gone.
 */
function makeSignTexture(label: string, face: string, ink: string, family: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = SIGN_PX.width
  canvas.height = SIGN_PX.height
  const context = canvas.getContext('2d')!

  context.fillStyle = face
  context.fillRect(0, 0, SIGN_PX.width, SIGN_PX.height)

  // The inner keyline every printed board carries, set in from the trim.
  context.strokeStyle = ink
  context.globalAlpha = 0.42
  context.lineWidth = 8
  context.strokeRect(31, 31, SIGN_PX.width - 62, SIGN_PX.height - 62)
  context.globalAlpha = 1

  context.fillStyle = ink
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // Shrink to fit rather than clip: "South Dinajpur" is twice the width of
  // "Malda" and both have to sit inside the same board.
  let size = 158
  do {
    context.font = '600 ' + size + 'px ' + family
    size -= 4
  } while (context.measureText(label).width > SIGN_PX.width - 130 && size > 48)

  context.fillText(label, SIGN_PX.width / 2, SIGN_PX.height / 2 + 4)

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** A soft round patch, used for the shadow a sign casts and its glow at night. */
function makeBlobTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

/** The walls of the model, in the darkest tone of the ramp so they read as earth. */
function Skirt({ relief, palette }: { relief: Relief; palette: Palette }) {
  const geometry = useMemo(() => buildSkirt(relief.metres), [relief])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={palette.ramp[0][1]} roughness={1} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

/** A small plate lying on the ground, giving a ring its distance. */
function makeRingLabelTexture(text: string, ink: string, family: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const context = canvas.getContext('2d')!
  context.fillStyle = ink
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '600 62px ' + family
  context.fillText(text, 128, 68)
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Rings on the ground at fixed distances from the workshop, draped over relief.
 *
 * Before these the terrain was a scatter of poles with nothing to say how far
 * the vans travel, which is the one question a coverage map exists to answer.
 * Each ring is cut where it leaves the plane, so none of them float off the
 * edge of the model.
 */
function ReachRings({ relief, palette, family }: { relief: Relief; palette: Palette; family: string }) {
  const base = useMemo(
    () => ({ x: lonToX(COVERAGE_PLACES[0].lon), z: latToZ(COVERAGE_PLACES[0].lat) }),
    [],
  )

  const rings = useMemo(
    () =>
      REACH_RINGS_KM.map(km => {
        const runs: [number, number, number][][] = []
        let run: [number, number, number][] = []

        for (let step = 0; step <= 180; step += 1) {
          const angle = (step / 180) * Math.PI * 2
          const x = base.x + Math.cos(angle) * km
          const z = base.z + Math.sin(angle) * km
          if (!onPlane(x, z)) {
            if (run.length > 1) runs.push(run)
            run = []
            continue
          }
          run.push([x, heightAt(relief.metres, xToLon(x), zToLat(z)) + 0.5, z])
        }
        if (run.length > 1) runs.push(run)

        const labelZ = base.z + km
        const label = onPlane(base.x, labelZ)
          ? ([base.x, heightAt(relief.metres, xToLon(base.x), zToLat(labelZ)) + 0.9, labelZ] as const)
          : null

        return { km, runs, label }
      }),
    [relief, base],
  )

  return (
    <>
      {rings.map(ring => (
        <group key={ring.km}>
          {ring.runs.map((points, index) => (
            <Line
              key={index}
              points={points}
              color={palette.reach}
              lineWidth={1.1}
              dashed
              dashSize={6}
              gapSize={5}
              transparent
              opacity={0.55}
            />
          ))}
          {ring.label && (
            <RingLabel km={ring.km} at={ring.label} palette={palette} family={family} />
          )}
        </group>
      ))}
    </>
  )
}

function RingLabel({
  km,
  at,
  palette,
  family,
}: {
  km: number
  at: readonly [number, number, number]
  palette: Palette
  family: string
}) {
  const texture = useMemo(
    () => makeRingLabelTexture(`${km} km`, palette.reach, family),
    [km, palette.reach, family],
  )
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[at[0], at[1], at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[21, 10.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** A fabricated sign standing on the terrain: frame, face, posts, footing. */
function Signboard({
  place,
  relief,
  palette,
  blob,
  family,
}: {
  place: CoveragePlace
  relief: Relief
  palette: Palette
  blob: THREE.Texture
  family: string
}) {
  const { active, select, setHovered } = useCoverageMap()

  // A board can unmount while the pointer is over it, on a theme change or a
  // a missed pointer event, and then `onPointerOut` never runs and the cursor
  // stays a pointer.
  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  const x = lonToX(place.lon)
  const z = latToZ(place.lat)
  const ground = heightAt(relief.metres, place.lon, place.lat)

  const isActive = active?.name === place.name

  const width = place.isBase ? 26 : 21
  const height = place.isBase ? 13 : 10.5
  const post = (place.isBase ? 17 : 12.5) + (BOARD_LIFT[place.name] ?? 0) * height

  // One face for every covered place, and gold only for the workshop. Grading
  // the boards by how many gallery photos could be pinned to each place put "4
  // projects" beside "on route" and read as a league table of where we have
  // worked, rather than a statement of where we go.
  const face = place.isBase ? palette.base : palette.covered
  const ink = place.isBase ? palette.baseInk : palette.coveredInk

  const texture = useMemo(
    () => makeSignTexture(place.name, face, ink, family),
    [place.name, face, ink, family],
  )
  useEffect(() => () => texture.dispose(), [texture])

  const glow = palette.emissive * (isActive ? 1.7 : 1)
  const posts: number[] = width >= 24 ? [-width * 0.29, width * 0.29] : [0]

  return (
    <group
      position={[x, ground, z]}
      onPointerOver={event => {
        event.stopPropagation()
        setHovered(place.name)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(null)
        document.body.style.cursor = ''
      }}
      onClick={event => {
        event.stopPropagation()
        select(place.name)
      }}
    >
      {/* Contact shadow, so the sign sits on the ground instead of hovering. */}
      <mesh position={[0, 0.25, 1.5]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[width * 0.95, width * 0.7]} />
        <meshBasicMaterial
          map={blob}
          color={palette.shadow}
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </mesh>

      {/* At night a lit sign throws light onto the ground under it. */}
      {palette.emissive > 0 && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 2.1, width * 2.1]} />
          <meshBasicMaterial
            map={blob}
            color={face}
            transparent
            opacity={isActive ? 0.34 : 0.19}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {posts.map(offset => (
        <group key={offset}>
          <mesh position={[offset, post / 2, 0]}>
            <cylinderGeometry args={[0.42, 0.58, post, 8]} />
            <meshStandardMaterial color={palette.structure} roughness={0.7} />
          </mesh>
          {/* Footing where the post meets the ground. */}
          <mesh position={[offset, 0.6, 0]}>
            <cylinderGeometry args={[1.25, 1.6, 1.2, 10]} />
            <meshStandardMaterial color={palette.structure} roughness={0.85} />
          </mesh>
        </group>
      ))}

      <Billboard position={[0, post + height / 2, 0]} lockX lockZ>
        <group scale={isActive ? 1.16 : 1}>
          {/* The frame the board is mounted in, which also gives it thickness. */}
          <mesh>
            <boxGeometry args={[width + 1.7, height + 1.7, 1.1]} />
            <meshStandardMaterial color={palette.structure} roughness={0.6} />
          </mesh>

          {/*
            `toneMapped` off keeps the board the exact brand cerulean and gold.
            Left on, the renderer's filmic curve washed a lit sign out to near
            white, which is the one thing a signage company's map must not do.
            `emissiveMap` is the same artwork, so at night the face lights up
            while the lettering on it stays dark, the way a real light box does.
          */}
          <mesh position={[0, 0, 0.62]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial
              map={texture}
              emissiveMap={texture}
              emissive="#ffffff"
              emissiveIntensity={glow}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Billboard>
    </group>
  )
}

/**
 * Splits a border line into the runs that sit on the terrain plane.
 *
 * The borders file carries a quarter degree of margin past the frame, so the
 * flat map's strokes run off its edge instead of stopping short. In 3D there is
 * nothing out there to run onto: the plane ends at the bounds, so those points
 * hung in mid air as spikes above the ridge line. Anything past the edge is
 * dropped, and the line resumes where it comes back on.
 */
function clipToPlane(line: [number, number][]): [number, number][][] {
  const runs: [number, number][][] = []
  let run: [number, number][] = []

  for (const point of line) {
    const [lon, lat] = point
    const inside =
      lon >= BOUNDS.west && lon <= BOUNDS.east && lat >= BOUNDS.south && lat <= BOUNDS.north
    if (inside) {
      run.push(point)
    } else if (run.length) {
      runs.push(run)
      run = []
    }
  }
  if (run.length) runs.push(run)

  return runs.filter(candidate => candidate.length > 1)
}

/** State borders, draped over the relief so they follow the ground. */
function Borders({ relief, palette }: { relief: Relief; palette: Palette }) {
  const [lines, setLines] = useState<[number, number, number][][]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/data/north-bengal-borders.json')
      .then(response => response.json())
      .then((data: { features: { lines: [number, number][][] }[] }) => {
        if (cancelled) return
        setLines(
          data.features.flatMap(feature =>
            feature.lines.flatMap(line =>
              clipToPlane(line).map(run =>
                run.map(([lon, lat]) =>
                  // Lifted a touch so the line never sinks into the surface.
                  [lonToX(lon), heightAt(relief.metres, lon, lat) + 0.4, latToZ(lat)] as [number, number, number],
                ),
              ),
            ),
          ),
        )
      })
      .catch(() => {
        // Borders are context, not content. The flat map underneath still has
        // them, so a failed fetch here is not worth surfacing to the visitor.
      })

    return () => {
      cancelled = true
    }
  }, [relief])

  return (
    <>
      {lines.map((points, index) => (
        <Line key={index} points={points} color={palette.border} lineWidth={1.2} transparent opacity={0.75} />
      ))}
    </>
  )
}

type Controls = { target: THREE.Vector3; update: () => void }

/**
 * The regional view, framed on the band the places occupy.
 *
 * It has to sit inside the orbit limits set on the controls below. The earlier
 * position was 329 units out at a polar angle of 1.056, just past both the 330
 * and 1.05 caps, so the controls clamped it short and the rig's arrival check
 * never passed: it kept steering the camera every frame until the visitor
 * touched the map. This one is 315 out at 1.00, comfortably inside.
 */
const OVERVIEW_TARGET = [0, 6, -28] as const
const OVERVIEW_POSITION = [0, 176, 237] as const

/**
 * Eases the camera toward whatever is selected, and back out to the regional
 * view when nothing is.
 *
 * OrbitControls owns the camera, so this drives the controls rather than the
 * camera directly: moving both the position and the orbit target, then letting
 * the controls recompute. The flight stops as soon as it arrives or the visitor
 * grabs the map, so a drag is never fought by an animation still running
 * underneath it.
 */
function CameraRig({
  relief,
  controlsRef,
  flyingRef,
}: {
  relief: Relief
  controlsRef: React.RefObject<Controls | null>
  flyingRef: React.RefObject<boolean>
}) {
  // Deliberately `selected`, not `active`. Flying on hover meant dragging the
  // pointer down the place list whipped the camera across the region eleven
  // times. Hovering highlights; committing to a place moves the camera.
  const { selected } = useCoverageMap()
  const { camera } = useThree()
  const wantedTarget = useRef(new THREE.Vector3(...OVERVIEW_TARGET))
  const wantedPosition = useRef(new THREE.Vector3(...OVERVIEW_POSITION))

  useEffect(() => {
    if (selected) {
      const x = lonToX(selected.lon)
      const z = latToZ(selected.lat)
      wantedTarget.current.set(x, heightAt(relief.metres, selected.lon, selected.lat), z)
      wantedPosition.current.set(x + 30, 118, z + 168)
    } else {
      // Framed on the band the places actually occupy, from Sikkim down to
      // Malda, rather than on the centre of the plane. Centring left the
      // bottom third of the frame as empty Bangladeshi plain.
      wantedTarget.current.set(...OVERVIEW_TARGET)
      wantedPosition.current.set(...OVERVIEW_POSITION)
    }
    flyingRef.current = true
  }, [selected, relief, flyingRef])

  useFrame((_, delta) => {
    if (!flyingRef.current || !controlsRef.current) return

    const ease = Math.min(delta * 2.2, 1)
    camera.position.lerp(wantedPosition.current, ease)
    controlsRef.current.target.lerp(wantedTarget.current, ease)
    controlsRef.current.update()

    if (camera.position.distanceTo(wantedPosition.current) < 1.5) flyingRef.current = false
  })

  return null
}

/**
 * Reports once the relief has actually been drawn.
 *
 * The stage fades the flat map out only after this fires. Fading it as soon as
 * the chunk mounted meant any failure after that point left an empty panel.
 */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const reportedRef = useRef(false)

  useFrame(() => {
    if (reportedRef.current) return
    reportedRef.current = true
    onReady()
  })

  return null
}

function Scene({
  palette,
  onReady,
  onFail,
}: {
  palette: Palette
  onReady: () => void
  onFail: () => void
}) {
  const relief = useRelief(onFail)
  const controlsRef = useRef<Controls | null>(null)
  const flyingRef = useRef(false)

  // One soft patch shared by every shadow and glow, and one font lookup, rather
  // than eleven of each.
  const blob = useMemo(() => makeBlobTexture(), [])
  const family = useMemo(() => headingFont(), [])
  useEffect(() => () => blob.dispose(), [blob])

  if (!relief) return null

  return (
    <>
      <FirstFrame onReady={onReady} />

      {/* Haze in the surface colour, so the far edge of the plane dissolves
          into the page instead of ending on a hard horizontal cut. */}
      <fog attach="fog" args={[palette.fog, 400, 1000]} />

      <ambientLight intensity={palette.ambient} />
      {/* Low and from the north west, so the ridges cast the long shadows that
          tell you which way the ground falls away. */}
      <directionalLight position={[-160, 150, -220]} intensity={palette.sun} />
      <directionalLight position={[180, 240, 260]} intensity={palette.sun * 0.35} />

      <TerrainSurface relief={relief} palette={palette} />
      <Skirt relief={relief} palette={palette} />

      <Borders relief={relief} palette={palette} />
      <ReachRings relief={relief} palette={palette} family={family} />

      {COVERAGE_PLACES.map(place => (
        <Signboard
          key={place.name}
          place={place}
          relief={relief}
          palette={palette}
          blob={blob}
          family={family}
        />
      ))}

      <CameraRig relief={relief} controlsRef={controlsRef} flyingRef={flyingRef} />
      {/*
        Locked deliberately. With the old range the camera could be pulled back
        and swung round until the model showed as a square tile floating in
        empty space. Every position inside these limits keeps the terrain filling
        the frame, so the region always reads as land rather than as an object.
      */}
      <OrbitControls
        ref={controlsRef as never}
        onStart={() => {
          flyingRef.current = false
        }}
        enablePan={false}
        enableZoom
        minDistance={175}
        maxDistance={330}
        minPolarAngle={0.55}
        maxPolarAngle={1.05}
        minAzimuthAngle={-0.5}
        maxAzimuthAngle={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

export function CoverageTerrain({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
  const theme = useTheme()
  const palette = useMemo(() => PALETTES[theme], [theme])

  return (
    <div className={styles.terrain} aria-hidden="true">
      <Canvas
        camera={{ position: [...OVERVIEW_POSITION], fov: 40, near: 1, far: 2000 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          // A lost context blanks the canvas mid-visit. Hand back to the flat
          // map rather than leave an empty panel where the terrain was.
          gl.domElement.addEventListener('webglcontextlost', onFail, { once: true })
        }}
      >
        <Scene palette={palette} onReady={onReady} onFail={onFail} />
      </Canvas>
    </div>
  )
}
