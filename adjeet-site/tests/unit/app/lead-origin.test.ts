import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

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

describe('/api/lead origin check', () => {
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

  it('does not accept deployment URLs in production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_URL', 'adjeet-abc123-mr-rupams-projects.vercel.app')
    expect((await post('https://adjeet-abc123-mr-rupams-projects.vercel.app')).status).toBe(403)
  })
})
