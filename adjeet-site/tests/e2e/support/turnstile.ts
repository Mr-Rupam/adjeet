import { expect, type Page } from '@playwright/test'

/**
 * A hermetic Cloudflare Turnstile for e2e runs.
 *
 * The real widget cannot be driven from Playwright, for two reasons:
 *  1. Cloudflare's current api.js mounts its challenge iframe inside a CLOSED
 *     shadow root, so no selector, `frameLocator` included, can ever reach it.
 *  2. challenges.cloudflare.com is not always reachable from the machine
 *     running the suite.
 *
 * `stubTurnstile` answers every request to challenges.cloudflare.com from the
 * test itself. The api.js it serves implements the part of `window.turnstile`
 * that @marsidev/react-turnstile calls (render, reset, remove, getResponse,
 * isExpired, execute, ready), calls the `onload` callback named in the script
 * URL, and hands each widget Cloudflare's documented dummy token a moment
 * after it renders, the way the always-pass test site key does. The iframe it
 * draws sits in the light DOM on challenges.cloudflare.com and is served
 * blank, so an iframe assertion still means "the widget rendered".
 *
 * It does not relax the page's CSP. The stub is served from the URLs the real
 * widget uses, which `script-src` and `frame-src` in next.config.ts allow. If
 * either directive stops allowing challenges.cloudflare.com, the stub stops
 * loading too and `waitForTurnstileToken` fails, as the real widget would.
 *
 * It covers the browser only. `/api/lead` verifies the token with Cloudflare
 * from Node, which Playwright cannot intercept, so a test that submits the
 * form must route `/api/lead` as well.
 */

const CLOUDFLARE = 'https://challenges.cloudflare.com'
const WIDGET_FRAME_URL = `${CLOUDFLARE}/cdn-cgi/challenge-platform/e2e-stub/turnstile.html`
const WIDGET_FRAME_HTML =
  '<!doctype html><html><head><title>Turnstile e2e stub</title></head>' +
  '<body style="margin:0;min-height:100vh;font:12px system-ui,sans-serif">Success!</body></html>'

/** The token Cloudflare's always-pass test site key hands back. */
export const TURNSTILE_DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX'

type StubConfig = {
  onload: string | null
  token: string
  delayMs: number
  frameUrl: string
}

/*
 * Runs in the page, not in Node: it is serialised into the stubbed api.js, so
 * it must not refer to anything outside its own body.
 */
function installTurnstileStub(config: StubConfig) {
  type WidgetParams = {
    size?: string
    'response-field'?: boolean
    'response-field-name'?: string
    callback?: (token: string) => void
  }
  type Widget = {
    container: HTMLElement
    root: HTMLElement
    params: WidgetParams
    input: HTMLInputElement | null
    token: string
    timer: number | undefined
  }

  const widgets = new Map<string, Widget>()
  let rendered = 0

  // Like the real API, no id means the most recently rendered widget.
  const lookup = (id?: string): [string, Widget] | undefined => {
    if (id === undefined) return [...widgets.entries()].pop()
    const widget = widgets.get(id)
    return widget ? [id, widget] : undefined
  }

  // Issue the token a moment later, never synchronously. LeadForm clears its
  // own copy of the token straight after calling reset(), so a synchronous
  // callback would be wiped out before the visitor could retry.
  const solve = (id: string, widget: Widget) => {
    window.clearTimeout(widget.timer)
    widget.timer = window.setTimeout(() => {
      if (widgets.get(id) !== widget) return
      widget.token = config.token
      if (widget.input) widget.input.value = config.token
      widget.params.callback?.(config.token)
    }, config.delayMs)
  }

  const resolveTarget = (target: string | HTMLElement) =>
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target

  const api = {
    render(target: string | HTMLElement, params: WidgetParams = {}) {
      const container = resolveTarget(target)
      if (!container) throw new Error(`[turnstile stub] render target not found: ${String(target)}`)
      const id = `cf-chl-widget-e2e${++rendered}`
      const root = document.createElement('div')
      const frame = document.createElement('iframe')
      frame.src = `${config.frameUrl}?widget=${id}`
      frame.title = 'Widget containing a Cloudflare security challenge'
      const compact = params.size === 'compact'
      frame.style.cssText = `display:block;border:0;width:${compact ? 150 : 300}px;height:${compact ? 140 : 65}px`
      root.appendChild(frame)
      let input: HTMLInputElement | null = null
      if (params['response-field'] !== false) {
        input = document.createElement('input')
        input.type = 'hidden'
        input.name = params['response-field-name'] || 'cf-turnstile-response'
        input.id = `${id}_response`
        root.appendChild(input)
      }
      container.appendChild(root)
      const widget: Widget = { container, root, params, input, token: '', timer: undefined }
      widgets.set(id, widget)
      solve(id, widget)
      return id
    },
    reset(id?: string) {
      const found = lookup(id)
      if (!found) return
      const [key, widget] = found
      widget.token = ''
      if (widget.input) widget.input.value = ''
      solve(key, widget)
    },
    remove(id?: string) {
      const found = lookup(id)
      if (!found) return
      const [key, widget] = found
      window.clearTimeout(widget.timer)
      widget.root.remove()
      widgets.delete(key)
    },
    getResponse(id?: string) {
      return lookup(id)?.[1].token || undefined
    },
    isExpired() {
      return false
    },
    execute(target: string | HTMLElement) {
      const container = resolveTarget(target)
      for (const [key, widget] of widgets) {
        if (widget.container === container) solve(key, widget)
      }
    },
    ready(callback: () => void) {
      window.setTimeout(callback, 0)
    },
    implicitRender() {},
  }

  ;(window as unknown as { turnstile?: typeof api }).turnstile = api
  const onload = config.onload ? (window as unknown as Record<string, unknown>)[config.onload] : undefined
  if (typeof onload === 'function') onload()
}

/**
 * Serve a stub Turnstile for every request `page` makes to
 * challenges.cloudflare.com. Call it before the page loads the form.
 */
export async function stubTurnstile(
  page: Page,
  { token = TURNSTILE_DUMMY_TOKEN, delayMs = 50 }: { token?: string; delayMs?: number } = {},
) {
  await page.route(`${CLOUDFLARE}/**`, async (route) => {
    const url = new URL(route.request().url())
    // The library asks for /turnstile/v0/api.js?onload=<callback>&render=explicit.
    // Cloudflare answers that with a 302 to a versioned .../v0/b/<hash>/api.js.
    if (/^\/turnstile\/v0\/(?:.+\/)?api\.js$/.test(url.pathname)) {
      const config: StubConfig = { onload: url.searchParams.get('onload'), token, delayMs, frameUrl: WIDGET_FRAME_URL }
      return route.fulfill({
        contentType: 'text/javascript; charset=utf-8',
        body: `(${installTurnstileStub.toString()})(${JSON.stringify(config)});`,
      })
    }
    if (url.pathname.startsWith('/cdn-cgi/challenge-platform/')) {
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: WIDGET_FRAME_HTML })
    }
    // Nothing else on this host should be requested. Refuse it rather than let
    // an unexpected request reach the real network.
    return route.abort('blockedbyclient')
  })
}

/**
 * Wait until the widget has rendered and handed the form its token. Submitting
 * earlier is blocked by LeadForm's own CAPTCHA validation, so the request never
 * reaches /api/lead.
 */
export async function waitForTurnstileToken(page: Page, token = TURNSTILE_DUMMY_TOKEN) {
  await page
    .locator('iframe[src*="challenges.cloudflare.com"]')
    .contentFrame()
    .locator('body')
    .waitFor({ timeout: 10_000 })
  await expect(
    page.locator('input[name="cf-turnstile-response"]'),
    'the Turnstile stub never issued a token: does the CSP still allow challenges.cloudflare.com in script-src and frame-src?',
  ).toHaveValue(token, { timeout: 10_000 })
}
