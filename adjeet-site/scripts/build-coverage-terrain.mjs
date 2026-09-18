/**
 * Bakes the coverage map's terrain and borders into static assets.
 *
 * Run once, by hand, and commit the output:
 *   node scripts/build-coverage-terrain.mjs
 *
 * Nothing here runs at request time. The site's CSP keeps connect-src at 'self',
 * so the browser must never reach a tile server; it only ever loads the PNG and
 * JSON this script writes into public/data/.
 *
 * Elevation comes from the public, keyless AWS terrarium tiles (Mapzen data,
 * built from SRTM and friends). Terrarium packs metres into RGB as
 * (R * 256 + G + B / 256) - 32768, which survives a PNG round trip exactly, so
 * the same encoding is reused for the output and decoded again in the browser
 * by CoverageTerrain.
 *
 * `sharp` is not a direct dependency. It resolves through Next, which ships it
 * for image optimisation, so run this from the adjeet-site folder.
 */
import sharp from 'sharp'
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const ZOOM = 8
const TILE = 256

/**
 * The frame the existing generated map already uses, so the 3D terrain, the 2D
 * SVG and the committed geometry all describe the same rectangle of the world.
 */
export const BOUNDS = { west: 87.0, east: 90.6, south: 24.0, north: 27.8 }

/** Output grid. 256 is roughly 1.4km per sample, plenty for regional relief. */
const OUT = 256

const ROOT = resolve(import.meta.dirname, '..')
const RELIEF_PNG = resolve(ROOT, 'public/data/north-bengal-relief.png')
const RELIEF_META = resolve(ROOT, 'public/data/north-bengal-relief.json')
const BORDERS_JSON = resolve(ROOT, 'public/data/north-bengal-borders.json')
const GEOGRAPHY = resolve(ROOT, 'design/coverage-geography.json')
const GEOMETRY_TS = resolve(ROOT, 'content/coverage-geometry.ts')

const lonToWorldX = lon => ((lon + 180) / 360) * TILE * 2 ** ZOOM
const latToWorldY = lat => {
  const phi = (lat * Math.PI) / 180
  return ((1 - Math.asinh(Math.tan(phi)) / Math.PI) / 2) * TILE * 2 ** ZOOM
}

async function fetchTile(x, y) {
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${ZOOM}/${x}/${y}.png`
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (error) {
      if (attempt === 3) throw new Error(`Tile ${ZOOM}/${x}/${y} failed: ${error.message}`)
      await new Promise(done => setTimeout(done, 400 * attempt))
    }
  }
}

/** Downloads every tile the bounds touch and stitches them into one RGB buffer. */
async function buildMosaic() {
  const xMin = Math.floor(lonToWorldX(BOUNDS.west) / TILE)
  const xMax = Math.floor(lonToWorldX(BOUNDS.east) / TILE)
  const yMin = Math.floor(latToWorldY(BOUNDS.north) / TILE)
  const yMax = Math.floor(latToWorldY(BOUNDS.south) / TILE)

  const cols = xMax - xMin + 1
  const rows = yMax - yMin + 1
  const width = cols * TILE
  const height = rows * TILE
  const mosaic = Buffer.alloc(width * height * 3)

  console.log(`Fetching ${cols * rows} terrarium tiles at z${ZOOM}...`)
  for (let ty = yMin; ty <= yMax; ty += 1) {
    for (let tx = xMin; tx <= xMax; tx += 1) {
      const png = await fetchTile(tx, ty)
      const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      if (info.width !== TILE || info.height !== TILE) {
        throw new Error(`Tile ${tx}/${ty} is ${info.width}x${info.height}, expected ${TILE}`)
      }
      const originX = (tx - xMin) * TILE
      const originY = (ty - yMin) * TILE
      for (let row = 0; row < TILE; row += 1) {
        const from = row * TILE * 3
        const to = ((originY + row) * width + originX) * 3
        data.copy(mosaic, to, from, from + TILE * 3)
      }
      process.stdout.write('.')
    }
  }
  process.stdout.write('\n')

  return { mosaic, width, height, originX: xMin * TILE, originY: yMin * TILE }
}

const decode = (buf, index) => buf[index] * 256 + buf[index + 1] + buf[index + 2] / 256 - 32768

/** Bilinear sample of the mosaic, in metres, at a world pixel position. */
function sampleMetres(mosaic, width, height, x, y) {
  const cx = Math.min(Math.max(x, 0), width - 1.001)
  const cy = Math.min(Math.max(y, 0), height - 1.001)
  const x0 = Math.floor(cx)
  const y0 = Math.floor(cy)
  const fx = cx - x0
  const fy = cy - y0
  const at = (px, py) => decode(mosaic, (py * width + px) * 3)
  const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx
  const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx
  return top * (1 - fy) + bottom * fy
}

/**
 * Resamples the Mercator mosaic onto an equirectangular grid.
 *
 * Doing this at build time is what lets both map layers share one trivial
 * linear projection: afterwards longitude and latitude map straight onto UV, so
 * a signpost placed by lat/lon in the 3D scene lands on the same spot as the
 * same place in the flat SVG.
 */
function resampleToEquirectangular({ mosaic, width, height, originX, originY }) {
  const out = Buffer.alloc(OUT * OUT * 3)
  let min = Infinity
  let max = -Infinity

  for (let j = 0; j < OUT; j += 1) {
    const lat = BOUNDS.north - ((j + 0.5) / OUT) * (BOUNDS.north - BOUNDS.south)
    const worldY = latToWorldY(lat) - originY
    for (let i = 0; i < OUT; i += 1) {
      const lon = BOUNDS.west + ((i + 0.5) / OUT) * (BOUNDS.east - BOUNDS.west)
      const worldX = lonToWorldX(lon) - originX
      const metres = sampleMetres(mosaic, width, height, worldX, worldY)
      if (metres < min) min = metres
      if (metres > max) max = metres

      // Re-encode in terrarium so the browser decodes it with the same formula.
      const packed = Math.round(Math.min(Math.max(metres + 32768, 0), 65535.99) * 256)
      const index = (j * OUT + i) * 3
      out[index] = (packed >> 16) & 0xff
      out[index + 1] = (packed >> 8) & 0xff
      out[index + 2] = packed & 0xff
    }
  }

  return { out, min, max }
}

/**
 * Drops points that sit within tolerance degrees of the line they span.
 *
 * These are closed rings, so the first and last point are the same and the
 * baseline between them has no length. Perpendicular distance to a zero length
 * line is always zero, which would collapse every ring to two points and throw
 * the whole border away. When the baseline degenerates, measure straight line
 * distance from the start instead: that picks the point farthest around the
 * ring, splits there, and the two halves then simplify normally.
 */
function simplify(points, tolerance) {
  if (points.length < 3) return points
  let farthest = 0
  let distance = 0
  const [ax, ay] = points[0]
  const [bx, by] = points[points.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const span = Math.hypot(dx, dy)
  const closed = span < 1e-12

  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i]
    const offset = closed
      ? Math.hypot(px - ax, py - ay)
      : Math.abs(dy * px - dx * py + bx * ay - by * ax) / span
    if (offset > distance) {
      distance = offset
      farthest = i
    }
  }

  if (distance <= tolerance) return [points[0], points[points.length - 1]]
  return [
    ...simplify(points.slice(0, farthest + 1), tolerance),
    ...simplify(points.slice(farthest), tolerance).slice(1),
  ]
}

/** A margin beyond the frame, so lines run off the edge instead of stopping short. */
const MARGIN = 0.25
const inBounds = ([lon, lat]) =>
  lon >= BOUNDS.west - MARGIN && lon <= BOUNDS.east + MARGIN &&
  lat >= BOUNDS.south - MARGIN && lat <= BOUNDS.north + MARGIN

/**
 * Cuts a closed ring into the open polylines that actually cross the frame.
 *
 * Natural Earth gives whole states: the West Bengal ring runs all the way down
 * to the Bay of Bengal, which is thousands of points nothing ever draws. Keeping
 * only the runs of consecutive in-frame points, plus one point either side so
 * the line leaves the frame cleanly, is what takes the borders from 31kb to a
 * few kb.
 */
function clipRing(ring) {
  const lines = []
  let current = null

  for (let i = 0; i < ring.length; i += 1) {
    const point = ring[i]
    if (inBounds(point)) {
      if (!current) {
        current = []
        // Lead in from the previous point so the stroke starts off-frame.
        if (i > 0) current.push(ring[i - 1])
      }
      current.push(point)
    } else if (current) {
      current.push(point)
      lines.push(current)
      current = null
    }
  }
  if (current) lines.push(current)

  return lines
}

/** Turns the Natural Earth polygons into frame-clipped, simplified polylines. */
async function buildBorders(tolerance) {
  const geo = JSON.parse(await readFile(GEOGRAPHY, 'utf8'))
  const features = []

  for (const feature of geo.features) {
    const { geometry, properties } = feature
    const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]
    const lines = []
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const segment of clipRing(ring.map(([lon, lat]) => [lon, lat]))) {
          const trimmed = simplify(segment, tolerance)
          if (trimmed.length > 1) {
            lines.push(trimmed.map(([lon, lat]) => [+lon.toFixed(4), +lat.toFixed(4)]))
          }
        }
      }
    }
    if (lines.length) features.push({ name: properties.name, lines })
  }

  return features
}

/**
 * The flat map's projection, matching the frame the generated SVG already used
 * so the new component lines up with the geometry that was committed before it.
 */
const FLAT = { width: 900, height: 1000 }
const flatX = lon => 100 + (lon - BOUNDS.west) * 220
const flatY = lat => 60 + (BOUNDS.north - lat) * 250

/**
 * Emits the border polylines as SVG path strings.
 *
 * The flat map is the accessible baseline and renders on the server, so it must
 * not wait on a fetch to draw its own geography. Baking the paths into a module
 * keeps it a single server-rendered SVG, and leaves the lon/lat JSON purely for
 * the 3D layer, which loads it alongside its own chunk.
 */
function bordersToModule(features) {
  const paths = features.map(feature => {
    const d = feature.lines
      .map(line => line.map(([lon, lat], i) =>
        `${i === 0 ? 'M' : 'L'}${flatX(lon).toFixed(1)},${flatY(lat).toFixed(1)}`).join(''))
      .join('')
    return `  { name: ${JSON.stringify(feature.name)}, d: ${JSON.stringify(d)} },`
  })

  return `// Generated by scripts/build-coverage-terrain.mjs. Do not edit by hand.
//
// Border polylines from Natural Earth Admin-1, clipped to the coverage frame and
// projected into the flat map's ${FLAT.width}x${FLAT.height} viewBox.

export const COVERAGE_VIEWBOX = { width: ${FLAT.width}, height: ${FLAT.height} } as const

export const COVERAGE_BOUNDS = ${JSON.stringify(BOUNDS)} as const

/** Projects a place onto the flat map, in viewBox units. */
export function projectFlat(lon: number, lat: number): { x: number; y: number } {
  return { x: 100 + (lon - ${BOUNDS.west}) * 220, y: 60 + (${BOUNDS.north} - lat) * 250 }
}

export const COVERAGE_BORDERS = [
${paths.join('\n')}
] as const
`
}

async function main() {
  await mkdir(dirname(RELIEF_PNG), { recursive: true })

  const mosaic = await buildMosaic()
  const { out, min, max } = resampleToEquirectangular(mosaic)

  await sharp(out, { raw: { width: OUT, height: OUT, channels: 3 } })
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toFile(RELIEF_PNG)

  // The 3D layer drapes lines over relief, so it wants the denser geometry.
  // The flat map draws at about 390px wide, where half the points are invisible.
  const drapedBorders = await buildBorders(0.004)
  const flatBorders = await buildBorders(0.012)

  await writeFile(BORDERS_JSON, JSON.stringify({ bounds: BOUNDS, features: drapedBorders }))
  await writeFile(GEOMETRY_TS, bordersToModule(flatBorders))
  await writeFile(
    RELIEF_META,
    JSON.stringify({
      bounds: BOUNDS,
      size: OUT,
      minMetres: Math.round(min),
      maxMetres: Math.round(max),
      encoding: 'terrarium',
      source: 'AWS terrain tiles (Mapzen), z8, resampled to equirectangular',
    }, null, 2),
  )

  const { size } = await stat(RELIEF_PNG)
  console.log(`relief  ${OUT}x${OUT}  ${min.toFixed(0)}m to ${max.toFixed(0)}m  ${(size / 1024).toFixed(1)}kb`)
  const lineCount = f => f.reduce((n, x) => n + x.lines.length, 0)
  console.log(`borders draped ${drapedBorders.length} features / ${lineCount(drapedBorders)} lines, flat ${lineCount(flatBorders)} lines`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
