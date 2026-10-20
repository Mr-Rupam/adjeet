/*
 * JPEG copies of project photos for link previews (og:image).
 *
 * Usage, from adjeet-site/:
 *   node scripts/build-share-images.mjs /images/work/havells-glow-sign-015.webp [...]
 *
 * Some apps do not render WebP previews, so each photo a page uses as its
 * og:image gets a JPEG beside it in public/images/share/, with the same name.
 * The photo is used as photographed: same framing, never upscaled, only
 * scaled down to fit 1200 px on its longer side. `shareImageFor` in
 * content/photo-places.ts builds the matching path, and
 * tests/unit/content/share-images.test.ts fails if a page asks for a copy that
 * does not exist.
 */
import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'

const sources = process.argv.slice(2)
if (sources.length === 0) {
  console.error('Pass the /images/work/... paths of the photos to copy.')
  process.exit(1)
}

const outDir = path.resolve('public/images/share')
await fs.mkdir(outDir, { recursive: true })

for (const src of sources) {
  const match = src.match(/^\/images\/work\/([^/]+)\.webp$/)
  if (!match) throw new Error(`Not a gallery photo path: ${src}`)
  const input = path.resolve('public' + src)
  const output = path.join(outDir, `${match[1]}.jpg`)
  const info = await sharp(input)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(output)
  console.log(`${path.relative(process.cwd(), output)} ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`)
}
