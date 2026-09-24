/*
 * Tell IndexNow search engines (Bing, and through it Copilot and ChatGPT
 * search, plus Yandex, Naver, Seznam and Yep) which adjeet.in pages changed.
 *
 *   node scripts/indexnow.mjs --since 2026-09-20   pages whose sitemap lastmod is on or after that date
 *   node scripts/indexnow.mjs --all                every sitemap URL
 *   add --dry-run to print the list without submitting
 *
 * The key is the one `public/<key>.txt` file whose name is its own contents;
 * IndexNow fetches it from the live site to prove the submission is ours, so
 * the script checks the live copy first. Google does not use IndexNow.
 *
 * Runs after every production deploy from .github/workflows/indexnow.yml.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

/** The IndexNow key: the name of the single `public/<32 hex>.txt` file, which must contain exactly that name. */
export function readKey(publicDir = PUBLIC_DIR) {
  const keyFiles = fs.readdirSync(publicDir).filter(name => /^[0-9a-f]{32}\.txt$/.test(name))
  if (keyFiles.length !== 1) throw new Error(`Expected one IndexNow key file in public/, found ${keyFiles.length}`)
  const key = keyFiles[0].replace(/\.txt$/, '')
  if (fs.readFileSync(path.join(publicDir, keyFiles[0]), 'utf8').trim() !== key) {
    throw new Error(`public/${keyFiles[0]} must contain exactly its own name`)
  }
  return key
}

/** `<loc>` and the date part of `<lastmod>` for every `<url>` in a sitemap. */
export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(([, block]) => ({
      loc: block.match(/<loc>(.*?)<\/loc>/)?.[1],
      lastmod: block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]?.slice(0, 10),
    }))
    .filter(entry => entry.loc)
}

/**
 * Every URL with `all`, else those whose lastmod is on or after `since`
 * (YYYY-MM-DD). ISO dates compare correctly as strings, and an entry with no
 * lastmod counts as changed, because nothing says it did not.
 *
 * @param {{ loc: string, lastmod?: string }[]} entries
 * @param {{ since?: string, all?: boolean }} options
 */
export function selectUrls(entries, { since, all = false }) {
  if (all) return entries.map(entry => entry.loc)
  if (!since || !/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error(`since must be YYYY-MM-DD, got "${since}"`)
  return entries.filter(entry => !entry.lastmod || entry.lastmod >= since).map(entry => entry.loc)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// A new production deployment can take a minute to reach the domain, so give
// the live key file a few chances before giving up.
async function confirmLiveKey(keyLocation, key) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const response = await fetch(keyLocation, { cache: 'no-store' }).catch(error => ({ ok: false, status: String(error) }))
    if (response.ok && (await response.text()).trim() === key) return
    console.log(`Key file not live yet (attempt ${attempt}, ${response.status}); retrying in 30s`)
    await sleep(30_000)
  }
  throw new Error(`${keyLocation} does not serve the key, so IndexNow would reject the submission`)
}

async function main() {
  const { values } = parseArgs({
    options: {
      site: { type: 'string', default: 'https://adjeet.in' },
      since: { type: 'string' },
      all: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
  })
  if (!values.all && !values.since) throw new Error('Pass --since YYYY-MM-DD or --all')
  const site = values.site.replace(/\/$/, '')
  const key = readKey()
  const keyLocation = `${site}/${key}.txt`

  // Check the key before reading the sitemap. Right after a deploy the domain
  // can still serve the previous build, whose sitemap would show no new dates;
  // the first time, the key file exists only in the new build, so this also
  // waits for it to go live.
  if (!values['dry-run']) await confirmLiveKey(keyLocation, key)

  const sitemap = await fetch(`${site}/sitemap.xml`, { cache: 'no-store' })
  if (!sitemap.ok) throw new Error(`sitemap.xml returned ${sitemap.status}`)
  const entries = parseSitemap(await sitemap.text())
  if (entries.length === 0) throw new Error('sitemap.xml lists no URLs')

  const urlList = selectUrls(entries, { since: values.since, all: values.all })
  if (urlList.length === 0) {
    console.log(`No sitemap URL has a lastmod on or after ${values.since}; nothing to submit.`)
    return
  }
  console.log(`${urlList.length} URL(s) to submit:\n${urlList.map(url => '  ' + url).join('\n')}`)
  if (values['dry-run']) return

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList }),
  })
  // 200: accepted. 202: accepted, key check pending. Anything else is a failure.
  const detail = await response.text()
  console.log(`IndexNow responded ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`)
  if (response.status !== 200 && response.status !== 202) process.exitCode = 1
}

// Run only when invoked as a script, so tests can import the helpers above.
// Windows paths compare case-insensitively.
const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b
if (process.argv[1] && samePath(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) await main()
