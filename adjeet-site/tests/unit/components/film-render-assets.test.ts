// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { WORK_PICKS } from '@/content/home-film'
import { PREVIEW } from '@/components/film/art-previews'
import { WORK_COLOR } from '@/components/film/work-colors'

const css = fs.readFileSync(path.resolve('components/film/film.css'), 'utf8')
// The scenes' part of the stylesheet (from "The camera and the plate" on).
const scenes = css.slice(css.indexOf('/* ---------- The camera and the plate ---------- */'))

describe('home film: cheap to draw, never blank', () => {
  it('gives every scene plate a tiny inline preview, well under 1 KB', () => {
    expect(Object.keys(PREVIEW).length).toBe(12)
    for (const [name, url] of Object.entries(PREVIEW)) {
      expect(url, name).toMatch(/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/)
      expect(url.length, name).toBeLessThan(700)
    }
  })

  it('gives every work photograph an average colour for its empty frame', () => {
    for (const pick of WORK_PICKS) expect(WORK_COLOR[pick.id], pick.id).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('draws no blurred shadow on the photo wall and no mask on a screen-sized picture', () => {
    const frame = scenes.match(/\.film \.w-frame \{[^}]*\}/)![0]
    for (const shadow of frame.match(/box-shadow:[^;]*/)![0].split(/,(?![^(]*\))/)) {
      expect(shadow.trim().replace('box-shadow:', '').trim().split(/\s+/).slice(0, 3), shadow).toEqual(['0', '0', '0'])
    }
    expect(scenes).not.toMatch(/\.w-view \{[^}]*mask/)
    expect(scenes).not.toMatch(/(road|hills|junction)-cam > picture[^{]*\{[^}]*mask/)
    expect(scenes).not.toMatch(/\.hills \.planes \{[^}]*mask/)
  })
})
