// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import manifest from '@/app/manifest'

describe('web app manifest', () => {
  it('names the business, uses icons that exist and takes its colours from the design tokens', () => {
    const result = manifest()
    expect(result.short_name).toBe('AD JEET')
    expect(result.name).toContain('Siliguri')
    expect(result.icons?.length).toBeGreaterThan(0)
    for (const icon of result.icons ?? []) expect(fs.existsSync(path.resolve('app' + icon.src)), icon.src).toBe(true)
    const tokens = fs.readFileSync(path.resolve('design/tokens.css'), 'utf8')
    expect(tokens).toContain(`--paper: ${result.background_color}`)
    expect(tokens).toContain(`--cerulean-deep: ${result.theme_color}`)
  })
})
