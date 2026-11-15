// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { business } from '@/lib/business'

const text = readFileSync(join(process.cwd(), 'public/.well-known/security.txt'), 'utf8')
const field = (name: string) => new RegExp(`^${name}: (.+)$`, 'm').exec(text)?.[1].trim()

// RFC 9116. Renew Expires before it passes: an expired file tells researchers
// the contact may be stale.
describe('/.well-known/security.txt', () => {
  it('names the business email as the contact', () => {
    expect(field('Contact')).toBe(`mailto:${business.email}`)
  })

  it('has an expiry in the future and at most a year and a bit away', () => {
    const expires = Date.parse(field('Expires') ?? '')
    expect(expires).toBeGreaterThan(Date.now())
    expect(expires - Date.now()).toBeLessThan(400 * 24 * 60 * 60 * 1000)
  })

  it('points at its own canonical URL on the live site', () => {
    expect(field('Canonical')).toBe(`${business.url}/.well-known/security.txt`)
  })
})
