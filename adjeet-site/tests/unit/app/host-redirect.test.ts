// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getRedirectUrl, unstable_getResponseFromNextConfig } from 'next/experimental/testing/server'
import nextConfig from '@/next.config'

const at = (url: string) => unstable_getResponseFromNextConfig({ url, nextConfig, headers: { host: new URL(url).host } })

// adjeet.vercel.app served a second copy of the site, and its forms posted
// from an origin the API no longer trusts. It now redirects to adjeet.in.
describe('adjeet.vercel.app', () => {
  it('redirects permanently to the same path on adjeet.in, keeping the query', async () => {
    const response = await at('https://adjeet.vercel.app/services/glow-sign-boards?city=Malda')
    expect(response.status).toBe(308)
    expect(getRedirectUrl(response)).toBe('https://adjeet.in/services/glow-sign-boards?city=Malda')
  })

  it('redirects the home page', async () => {
    const response = await at('https://adjeet.vercel.app/')
    expect(response.status).toBe(308)
    expect(getRedirectUrl(response)).toMatch(/^https:\/\/adjeet\.in\/?$/)
  })

  it('leaves adjeet.in, preview deployments and localhost alone', async () => {
    for (const url of [
      'https://adjeet.in/services/glow-sign-boards',
      'https://www.adjeet.in/contact',
      'https://adjeet-abc123-mr-rupams-projects.vercel.app/contact',
      'https://adjeet-git-some-branch-mr-rupams-projects.vercel.app/',
      'http://localhost:3000/contact',
    ]) {
      expect(getRedirectUrl(await at(url)), url).toBeNull()
    }
  })
})
