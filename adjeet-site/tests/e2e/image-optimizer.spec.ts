import { test, expect } from '@playwright/test'

// Next's image optimizer used to wedge an image size for good when a request
// for it was aborted while the source file was still streaming in: every later
// request for that exact URL hung (see patches/next+16.2.6.patch). Tests abort
// such requests all the time, and so do visitors who navigate away.
//
// Abort a spread of sizes of the largest local image at points inside that
// window, then ask for each again: every retry must answer. Only a size the
// server has never resized can wedge, so this catches a regression on a fresh
// server (as in CI) and passes trivially against a warm one.
const SOURCE = '/Ambuja_cement_ACP-LED.png'
const WIDTHS = [256, 384, 640, 750, 828, 1080, 1200, 1920]
const ABORT_AFTER_MS = [2, 5, 10]
const ACCEPT = { accept: 'image/webp,*/*' }

test('an aborted image resize does not wedge that size', async ({ request }) => {
  for (const [i, width] of WIDTHS.entries()) {
    const url = `/_next/image?url=${encodeURIComponent(SOURCE)}&w=${width}&q=75`
    await request.get(url, { headers: ACCEPT, timeout: ABORT_AFTER_MS[i % ABORT_AFTER_MS.length] }).catch(() => {})
    const retry = await request.get(url, { headers: ACCEPT, timeout: 15_000 })
    expect(retry.status(), `${width}px answers after an aborted request`).toBe(200)
  }
})
