import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { diffSnapshots, main, parseSitemap, readKey, selectUrls } from '@/scripts/indexnow.mjs'

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
<url>
<loc>https://adjeet.in</loc>
<lastmod>2026-09-24T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://adjeet.in/portfolio</loc>
<image:image>
<image:loc>https://adjeet.in/images/work/a.webp</image:loc>
</image:image>
<lastmod>2026-09-15T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://adjeet.in/contact</loc>
</url>
</urlset>`

describe('IndexNow key', () => {
  it('is one 32-character hex file in public/ that contains its own name', () => {
    const key = readKey()
    expect(key).toMatch(/^[0-9a-f]{32}$/)
    expect(fs.readFileSync(path.join(process.cwd(), 'public', `${key}.txt`), 'utf8')).toBe(key)
  })
})

describe('IndexNow URL selection', () => {
  const entries = parseSitemap(SITEMAP)

  it('reads each page URL and the date part of its lastmod, ignoring image URLs', () => {
    expect(entries).toEqual([
      { loc: 'https://adjeet.in', lastmod: '2026-09-24' },
      { loc: 'https://adjeet.in/portfolio', lastmod: '2026-09-15' },
      { loc: 'https://adjeet.in/contact', lastmod: undefined },
    ])
  })

  it('submits pages reviewed on or after the cut-off, and pages with no date', () => {
    expect(selectUrls(entries, { since: '2026-09-20' })).toEqual(['https://adjeet.in', 'https://adjeet.in/contact'])
    expect(selectUrls(entries, { since: '2026-09-15' })).toHaveLength(3)
    expect(selectUrls(entries, { since: '2026-09-25' })).toEqual(['https://adjeet.in/contact'])
  })

  it('submits everything when asked, and refuses a malformed cut-off', () => {
    expect(selectUrls(entries, { all: true })).toHaveLength(3)
    expect(() => selectUrls(entries, { since: '24/09/2026' })).toThrow()
    expect(() => selectUrls(entries, {})).toThrow()
  })
})

describe('IndexNow comparison with the last accepted submission', () => {
  const accepted = {
    'https://adjeet.in': '2026-09-24',
    'https://adjeet.in/portfolio': '2026-09-15',
    'https://adjeet.in/about': '2026-09-15',
  }

  it('submits a URL the last accepted submission did not list', () => {
    expect(diffSnapshots(accepted, {
      'https://adjeet.in': '2026-09-24',
      'https://adjeet.in/portfolio': '2026-09-15',
      'https://adjeet.in/about': '2026-09-15',
      'https://adjeet.in/neon-signs-in-siliguri': '2026-09-01',
    })).toEqual(['https://adjeet.in/neon-signs-in-siliguri'])
  })

  it('submits a URL whose lastmod moved, forwards or back', () => {
    expect(diffSnapshots(accepted, {
      'https://adjeet.in': '2026-09-24',
      'https://adjeet.in/portfolio': '2026-09-26',
      'https://adjeet.in/about': '2026-09-10',
    })).toEqual(['https://adjeet.in/portfolio', 'https://adjeet.in/about'])
  })

  it('submits nothing when every URL keeps the lastmod IndexNow accepted', () => {
    expect(diffSnapshots(accepted, {
      'https://adjeet.in': '2026-09-24',
      'https://adjeet.in/portfolio': '2026-09-15',
      'https://adjeet.in/about': '2026-09-15',
    })).toEqual([])
  })

  it('ignores a URL that has left the sitemap', () => {
    expect(diffSnapshots(accepted, { 'https://adjeet.in': '2026-09-24' })).toEqual([])
  })

  it('always submits a URL with no lastmod, because nothing says it did not change', () => {
    expect(diffSnapshots({ 'https://adjeet.in/contact': null }, { 'https://adjeet.in/contact': null }))
      .toEqual(['https://adjeet.in/contact'])
  })
})

describe('IndexNow submission run', () => {
  const key = readKey()
  const LIVE_SITEMAP = `<urlset>
<url><loc>https://adjeet.in</loc><lastmod>2026-09-24T00:00:00.000Z</lastmod></url>
<url><loc>https://adjeet.in/portfolio</loc><lastmod>2026-09-15T00:00:00.000Z</lastmod></url>
</urlset>`
  const LIVE_SNAPSHOT = { 'https://adjeet.in': '2026-09-24', 'https://adjeet.in/portfolio': '2026-09-15' }
  let dir: string
  let requests: { url: string; urlList?: string[] }[]

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'indexnow-'))
    requests = []
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    fs.rmSync(dir, { recursive: true, force: true })
  })

  /** The live site serves the key and LIVE_SITEMAP; IndexNow answers `status`. */
  function stubNetwork(status: number) {
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      requests.push({ url, urlList: init?.body ? JSON.parse(String(init.body)).urlList : undefined })
      if (url === `https://adjeet.in/${key}.txt`) return new Response(key)
      if (url === 'https://adjeet.in/sitemap.xml') return new Response(LIVE_SITEMAP)
      if (url === 'https://api.indexnow.org/indexnow') return new Response('', { status })
      return new Response('Not found', { status: 404 })
    })
  }

  const submitted = () => requests.find(request => request.url === 'https://api.indexnow.org/indexnow')?.urlList
  const inDir = (name: string) => path.join(dir, name)
  const writeFile = (name: string, contents: string) => {
    fs.writeFileSync(inDir(name), contents)
    return inDir(name)
  }
  const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'))

  it('submits only what changed since the last accepted submission, then saves the live sitemap', async () => {
    stubNetwork(200)
    const previous = writeFile('accepted.json', JSON.stringify({ 'https://adjeet.in': '2026-09-20', 'https://adjeet.in/portfolio': '2026-09-15' }))
    await main(['--since', '2026-09-01', '--previous', previous, '--save', inDir('next/snapshot.json')])
    expect(submitted()).toEqual(['https://adjeet.in'])
    expect(readJson(inDir('next/snapshot.json'))).toEqual(LIVE_SNAPSHOT)
  })

  it('submits nothing when no page changed since the last accepted submission', async () => {
    stubNetwork(200)
    const previous = writeFile('accepted.json', JSON.stringify(LIVE_SNAPSHOT))
    await main(['--since', '2026-09-01', '--previous', previous])
    expect(submitted()).toBeUndefined()
  })

  it('confirms the live key file before it reads the sitemap', async () => {
    stubNetwork(200)
    await main(['--all'])
    expect(requests.map(request => request.url)).toEqual([
      `https://adjeet.in/${key}.txt`,
      'https://adjeet.in/sitemap.xml',
      'https://api.indexnow.org/indexnow',
    ])
  })

  it('saves no snapshot when IndexNow rejects the submission, so its pages go again next run', async () => {
    stubNetwork(500)
    await expect(main(['--all', '--save', inDir('snapshot.json')])).rejects.toThrow(/500/)
    expect(fs.existsSync(inDir('snapshot.json'))).toBe(false)
  })

  it.each([
    ['missing', () => inDir('missing.json')],
    ['unreadable', () => writeFile('accepted.json', '{"https://adjeet.in": ')],
  ])('falls back to --since when the snapshot is %s, and saves one once IndexNow accepts', async (_, previous) => {
    stubNetwork(202)
    await main(['--since', '2026-09-20', '--previous', previous(), '--save', inDir('snapshot.json')])
    expect(submitted()).toEqual(['https://adjeet.in'])
    expect(readJson(inDir('snapshot.json'))).toEqual(LIVE_SNAPSHOT)
  })

  it('submits every URL with --all, whatever the snapshot says', async () => {
    stubNetwork(200)
    const previous = writeFile('accepted.json', JSON.stringify(LIVE_SNAPSHOT))
    await main(['--all', '--previous', previous])
    expect(submitted()).toEqual(['https://adjeet.in', 'https://adjeet.in/portfolio'])
  })

  it('submits and saves nothing on a dry run', async () => {
    stubNetwork(200)
    await main(['--all', '--dry-run', '--save', inDir('snapshot.json')])
    expect(submitted()).toBeUndefined()
    expect(fs.existsSync(inDir('snapshot.json'))).toBe(false)
  })
})

describe('IndexNow workflow', () => {
  const workflow = fs.readFileSync(path.join(process.cwd(), '..', '.github', 'workflows', 'indexnow.yml'), 'utf8').replace(/\r\n/g, '\n')
  const steps = workflow.slice(workflow.indexOf('\n    steps:\n')).split(/\n(?= {6}- )/).slice(1)
  const stepIndex = (marker: string) => steps.findIndex(step => step.includes(marker))
  const step = (marker: string) => steps[stepIndex(marker)] ?? ''

  it('lets the job list and download the artifacts of earlier runs', () => {
    expect(workflow).toMatch(/^permissions:\n( {2}[\w-]+: \w+\n)* {2}actions: read\n/m)
  })

  it('hands the script the snapshot the last accepted run uploaded, and uploads the one it saves under the same name', () => {
    expect(step('gh run download')).toContain('actions/artifacts?name=indexnow-snapshot')
    expect(step('gh run download')).toContain('--name indexnow-snapshot --dir "${{ runner.temp }}/indexnow-accepted"')
    expect(step('node scripts/indexnow.mjs')).toContain('--previous "${{ runner.temp }}/indexnow-accepted/snapshot.json"')
    expect(step('node scripts/indexnow.mjs')).toContain('--save "${{ runner.temp }}/indexnow-snapshot/snapshot.json"')
    expect(step('actions/upload-artifact')).toContain('name: indexnow-snapshot\n')
    expect(step('actions/upload-artifact')).toContain('path: ${{ runner.temp }}/indexnow-snapshot/snapshot.json\n')
  })

  it('uploads the snapshot only after the submission step succeeds', () => {
    expect(stepIndex('gh run download')).toBeGreaterThan(-1)
    expect(stepIndex('gh run download')).toBeLessThan(stepIndex('node scripts/indexnow.mjs'))
    expect(stepIndex('node scripts/indexnow.mjs')).toBeLessThan(stepIndex('actions/upload-artifact'))
    // With no `if:`, a step runs only when every step before it succeeded.
    expect(step('actions/upload-artifact')).not.toMatch(/^ +if:/m)
  })

  it('runs the script after successful production deployments only', () => {
    expect(workflow).toContain('deployment_status:')
    expect(workflow).toContain("github.event.deployment_status.state == 'success'")
    expect(workflow).toContain("github.event.deployment.environment == 'Production'")
    expect(workflow).toContain('node scripts/indexnow.mjs')
  })
})
