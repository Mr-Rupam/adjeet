import { afterEach, describe, expect, it, vi } from 'vitest'

// The production CSP has no 'unsafe-eval'. zod v4 probes eval support with
// new Function('') when an object schema is built, which the browser reports
// as a script-src violation on every page that loads the lead form.
describe('lead schema under a strict CSP', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds and parses without calling the Function constructor', async () => {
    let constructed = 0
    vi.stubGlobal(
      'Function',
      new Proxy(Function, {
        construct(target, args) {
          constructed++
          return Reflect.construct(target, args)
        },
        apply(target, thisArg, args) {
          constructed++
          return Reflect.apply(target, thisArg, args)
        },
      }),
    )

    const { leadSchema } = await import('@/lib/lead-schema')
    const result = leadSchema.safeParse({
      name: 'Rupam Das',
      phone: '9876543210',
      city: 'Siliguri',
      serviceInterest: ['flex-printing'],
      timeline: 'exploring',
      message: '',
      cfTurnstileResponse: 'token',
    })

    expect(result.success).toBe(true)
    expect(constructed).toBe(0)
  })
})
