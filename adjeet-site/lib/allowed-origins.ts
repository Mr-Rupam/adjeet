/**
 * The origins a browser may POST to /api/lead and /api/chatbot from.
 *
 * A browser sets Origin itself, so this stops a page on another site from
 * posting with a visitor's browser. It is not access control: a script can
 * send any Origin it likes, so Turnstile and the rate limits are what stop
 * scripted traffic.
 *
 * Production trusts the live site only. `localhost` is trusted only outside
 * production (`next dev`, tests), so a page served from a visitor's own
 * machine can never pass for the site. adjeet.vercel.app is not listed: it
 * redirects to adjeet.in (next.config.ts), so no form is served there.
 */
export function allowedOrigins(env: Record<string, string | undefined> = process.env): string[] {
  return [
    'https://adjeet.in',
    'https://www.adjeet.in',
    ...(env.NODE_ENV !== 'production' ? ['http://localhost:3000'] : []),
    // A Vercel preview may post from its own deployment and branch URLs, so the
    // form can be tested before it ships. Production never widens this list.
    ...(env.VERCEL_ENV === 'preview'
      ? [env.VERCEL_URL, env.VERCEL_BRANCH_URL]
          .filter((host): host is string => Boolean(host))
          .map((host) => `https://${host}`)
      : []),
  ]
}

/** The hostnames a Turnstile token may have been solved on: those of `allowedOrigins`. */
export function allowedHostnames(env: Record<string, string | undefined> = process.env): Set<string> {
  return new Set(allowedOrigins(env).map((origin) => new URL(origin).hostname))
}
