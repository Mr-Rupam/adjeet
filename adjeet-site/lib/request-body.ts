import { bounded } from '@/lib/lead-deadline'

/** The body sent was larger than the route accepts. */
export class BodyTooLarge extends Error {}

/**
 * Read a JSON request body, enforcing the size limit on the bytes actually
 * received, not on a Content-Length header a client controls (a chunked
 * request has none), and giving up after `ms` so a stalled upload cannot hold
 * the function open.
 */
export async function readJsonBody(req: { body: ReadableStream<Uint8Array> | null }, maxBytes: number, ms: number): Promise<unknown> {
  const reader = req.body?.getReader()
  if (!reader) throw new Error('Empty body')
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    return await bounded(async signal => {
      signal.addEventListener('abort', () => { void reader.cancel().catch(() => {}) }, { once: true })
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > maxBytes) { void reader.cancel().catch(() => {}); throw new BodyTooLarge() }
        chunks.push(value)
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
    }, ms)
  } finally {
    try { reader.releaseLock() } catch {}
  }
}
