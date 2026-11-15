import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// The chatbot's OpenAI client refuses to load in a browser-like test environment.
vi.mock('@/lib/ai', () => ({ default: {} }))

async function post(origin: string) {
  vi.resetModules()
  const { POST } = await import('@/app/api/lead/route')
  const req = new NextRequest('https://example.test/api/lead', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: '{}',
  })
  return POST(req)
}

// The first import of the route is slow on a cold transform cache.
describe('/api/lead origin check', { timeout: 20000 }, () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('accepts the production site', async () => {
    const res = await post('https://adjeet.in')
    // Past the origin check, the empty body fails validation.
    expect(res.status).toBe(422)
  })

  it('rejects unknown origins', async () => {
    expect((await post('https://evil.example')).status).toBe(403)
  })

  it("accepts a Vercel preview deployment's own URLs", async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('VERCEL_URL', 'adjeet-abc123-mr-rupams-projects.vercel.app')
    vi.stubEnv('VERCEL_BRANCH_URL', 'adjeet-git-some-branch-mr-rupams-projects.vercel.app')
    expect((await post('https://adjeet-abc123-mr-rupams-projects.vercel.app')).status).toBe(422)
    expect((await post('https://adjeet-git-some-branch-mr-rupams-projects.vercel.app')).status).toBe(422)
    expect((await post('https://adjeet-other-mr-rupams-projects.vercel.app')).status).toBe(403)
  })

  it('accepts localhost only outside production', async () => {
    expect((await post('http://localhost:3000')).status).toBe(422)
    vi.stubEnv('NODE_ENV', 'production')
    expect((await post('http://localhost:3000')).status).toBe(403)
  })

  it('no longer accepts the vercel.app host, which redirects to adjeet.in', async () => {
    expect((await post('https://adjeet.vercel.app')).status).toBe(403)
    expect((await post('https://www.adjeet.vercel.app')).status).toBe(403)
  })

  it('applies the same origins to the chatbot', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('@/app/api/chatbot/route')
    for (const origin of ['http://localhost:3000', 'https://adjeet.vercel.app']) {
      const req = new NextRequest('https://example.test/api/chatbot', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' })
      expect((await POST(req)).status, origin).toBe(403)
    }
  })

  it('does not accept deployment URLs in production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_URL', 'adjeet-abc123-mr-rupams-projects.vercel.app')
    expect((await post('https://adjeet-abc123-mr-rupams-projects.vercel.app')).status).toBe(403)
  })
})
