// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { clientIp, limiterKey, rateKey } from '@/lib/client-ip'

describe('rateKey', () => {
  it('keeps an IPv4 address whole', () => {
    expect(rateKey('203.0.113.7')).toBe('203.0.113.7')
    expect(rateKey(' 203.0.113.7 ')).toBe('203.0.113.7')
  })

  it('reduces an IPv6 address to its /64', () => {
    expect(rateKey('2401:4900:1c2a:5b3d:aaaa:bbbb:cccc:dddd')).toBe('2401:4900:1c2a:5b3d::/64')
  })

  it('gives every address in one /64 the same key', () => {
    const keys = new Set([
      '2401:4900:1c2a:5b3d::1',
      '2401:4900:1c2a:5b3d:1:2:3:4',
      '2401:4900:1c2a:5b3d:ffff:ffff:ffff:ffff',
      '2401:4900:1C2A:5B3D:0:0:0:9',
    ].map(rateKey))
    expect([...keys]).toEqual(['2401:4900:1c2a:5b3d::/64'])
  })

  it('tells different /64s apart', () => {
    expect(rateKey('2401:4900:1c2a:5b3d::1')).not.toBe(rateKey('2401:4900:1c2a:5b3e::1'))
  })

  it('expands compressed and zero-padded forms before cutting', () => {
    expect(rateKey('2001:db8::1')).toBe('2001:0db8:0000:0000::/64')
    expect(rateKey('2001:0db8:0:0:0:0:0:1')).toBe('2001:0db8:0000:0000::/64')
    expect(rateKey('::1')).toBe('0000:0000:0000:0000::/64')
    expect(rateKey('::')).toBe('0000:0000:0000:0000::/64')
    expect(rateKey('1::')).toBe('0001:0000:0000:0000::/64')
    expect(rateKey('2001:db8:1:2::')).toBe('2001:0db8:0001:0002::/64')
  })

  it('treats an IPv4-mapped IPv6 address as the IPv4 address', () => {
    expect(rateKey('::ffff:203.0.113.7')).toBe('203.0.113.7')
    expect(rateKey('::FFFF:cb00:7107')).toBe('203.0.113.7')
  })

  it('reads an address that ends in a dotted IPv4 tail', () => {
    expect(rateKey('64:ff9b::192.0.2.33')).toBe('0064:ff9b:0000:0000::/64')
  })

  it('ignores brackets and a zone id', () => {
    expect(rateKey('[2401:4900:1c2a:5b3d::1]')).toBe('2401:4900:1c2a:5b3d::/64')
    expect(rateKey('fe80::1%eth0')).toBe('fe80:0000:0000:0000::/64')
  })

  it.each(['', 'unknown', 'not an ip', '999.1.1.1', '1.2.3', '2001:db8::zzz', '2001:db8:::1', '1.2.3.4, 5.6.7.8'])(
    'returns null for %j',
    value => expect(rateKey(value)).toBeNull(),
  )
})

describe('clientIp', () => {
  const headers = (init: Record<string, string>) => new Headers(init)

  it('prefers x-real-ip', () => {
    expect(clientIp(headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }))).toBe('203.0.113.7')
  })

  it('falls back to the first x-forwarded-for entry', () => {
    expect(clientIp(headers({ 'x-forwarded-for': ' 198.51.100.1 , 10.0.0.1' }))).toBe('198.51.100.1')
  })

  it('falls back when x-real-ip is not an address', () => {
    expect(clientIp(headers({ 'x-real-ip': 'garbage', 'x-forwarded-for': '198.51.100.1' }))).toBe('198.51.100.1')
  })

  it('keeps an IPv6 address whole, for the CAPTCHA check', () => {
    expect(clientIp(headers({ 'x-forwarded-for': '2401:4900:1c2a:5b3d::1' }))).toBe('2401:4900:1c2a:5b3d::1')
  })

  it('is null when the request names no usable address', () => {
    expect(clientIp(headers({}))).toBeNull()
    expect(clientIp(headers({ 'x-forwarded-for': 'unknown' }))).toBeNull()
  })
})

describe('limiterKey', () => {
  it('is a stable SHA-256 hex digest that never contains the key itself', () => {
    const key = limiterKey('203.0.113.7')
    expect(key).toMatch(/^[0-9a-f]{64}$/)
    expect(key).toBe(limiterKey('203.0.113.7'))
    expect(key).not.toBe(limiterKey('203.0.113.8'))
    expect(limiterKey('2401:4900:1c2a:5b3d::/64')).not.toContain('2401')
  })
})
