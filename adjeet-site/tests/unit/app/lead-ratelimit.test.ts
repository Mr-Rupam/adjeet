import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Stand-in limiter that always rejects, so a 429 proves rate limiting is on.
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow() {
      return {}
    }
    async limit() {
      return { success: false }
    }
  }
  return { Ratelimit }
})
vi.mock('@upstash/redis', () => ({ Redis: { fromEnv: () => ({}) } }))

async function post() {
  vi.resetModules()
  const { POST } = await import('@/app/api/lead/route')
  return POST(
    new NextRequest('https://adjeet.in/api/lead', {
      method: 'POST',
      headers: { origin: 'https://adjeet.in', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
}

// The first import of the route is slow on a cold transform cache.
describe('/api/lead rate limiting', { timeout: 20000 }, () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is off when no Redis credentials are set', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.stubEnv('KV_REST_API_URL', '')
    vi.stubEnv('KV_REST_API_TOKEN', '')
    expect((await post()).status).toBe(422)
  })

  it('uses UPSTASH_REDIS_REST_* credentials', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token')
    expect((await post()).status).toBe(429)
  })

  it('uses the KV_REST_API_* names the Vercel Upstash integration sets', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
    vi.stubEnv('KV_REST_API_URL', 'https://example.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'token')
    expect((await post()).status).toBe(429)
  })
})
