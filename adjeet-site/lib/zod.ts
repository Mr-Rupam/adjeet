import { z } from 'zod'

// The production CSP has no 'unsafe-eval'. By default zod v4 probes eval with
// new Function('') when an object schema is built, and the browser reports
// that probe as a script-src violation. Jitless mode skips the probe and the
// compiled fast path; the lead form schema is small, so parsing stays quick.
// Import z from here, not from 'zod', so this runs before any schema exists.
z.config({ jitless: true })

export { z }
