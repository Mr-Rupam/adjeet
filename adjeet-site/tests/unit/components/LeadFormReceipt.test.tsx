import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LeadForm } from '@/components/sections/LeadForm'
const reset = vi.hoisted(() => vi.fn())
vi.mock('@/components/ui/DeferUntilNear', () => ({ DeferUntilNear: ({ children }: { children: React.ReactNode }) => children }))
vi.mock('@marsidev/react-turnstile', async () => {
  const React = await import('react')
  return { Turnstile: React.forwardRef(function Widget({ onSuccess }: { onSuccess: (token: string) => void }, ref) {
    React.useImperativeHandle(ref, () => ({ reset }))
    return <button type="button" onClick={() => onSuccess('fresh-token')}>Complete verification</button>
  }) }
})

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const echoReceipt = vi.fn(async (_url: string, options: RequestInit) => {
  const body = JSON.parse(String(options.body))
  return new Response(JSON.stringify({ ok: true, receiptId: body.submissionId }))
})
const bodies = (fetch: ReturnType<typeof vi.fn>) => fetch.mock.calls.map(([, options]) => JSON.parse(String((options as RequestInit).body)))

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); vi.restoreAllMocks() })

function complete(message?: string) {
  fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'রূপম দাস' } })
  fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '9876543210' } })
  if (message !== undefined) fireEvent.change(screen.getByLabelText(/Message/), { target: { value: message } })
  fireEvent.click(screen.getByRole('button', { name: 'Complete verification' }))
  fireEvent.click(screen.getByRole('button', { name: /Send the brief/ }))
}
const renderRegional = () => render(<LeadForm defaultCity="Siliguri" defaultService="glow-sign-boards" />)

describe('form defaults', () => {
  it('does not preselect urgency and offers help choosing', () => {
    render(<LeadForm />)
    expect(screen.getByLabelText('Timeline')).toHaveValue('unspecified')
    expect(screen.getByRole('checkbox', { name: /help choosing/i })).toBeInTheDocument()
  })
})

describe('honest client receipt', () => {
  it('confirms only a matching receipt, in neutral words with no time promise', async () => {
    vi.stubGlobal('fetch', echoReceipt)
    renderRegional()
    complete()
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent(/we have your enquiry and will contact you/i)
    expect(status.textContent).not.toMatch(/\b(within|hours?|minutes?|today|tomorrow|shortly|soon|asap|immediately)\b/i)
    expect(status).toHaveTextContent(bodies(echoReceipt)[0].submissionId)
  })

  it('does not show receipt or emit a conversion for an invalid success payload', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }))))
    renderRegional()
    complete()
    await screen.findByRole('alert')
    expect(screen.queryByText('Message received.')).not.toBeInTheDocument()
    expect(gtag).not.toHaveBeenCalled()
    expect(reset).toHaveBeenCalled()
  })

  it('shows the failure with the WhatsApp route and the reference when nothing could be saved', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options: RequestInit) => new Response(
      JSON.stringify({ error: 'We could not confirm that your enquiry reached us.', receiptId: JSON.parse(String(options.body)).submissionId }),
      { status: 503 },
    )))
    renderRegional()
    complete()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('could not confirm')
    expect(alert.querySelector('a[href^="https://wa.me/"]')).not.toBeNull()
    expect(alert).toHaveTextContent(/Enquiry reference: [0-9a-f-]{36}/)
    expect(screen.getByLabelText('Name *')).toHaveValue('রূপম দাস')
    expect(gtag).not.toHaveBeenCalled()
  })

  it('renews CAPTCHA after a network error and reuses the reference for the same brief', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('lost reply')).mockImplementation(echoReceipt)
    vi.stubGlobal('fetch', fetch)
    renderRegional()
    complete()
    await screen.findByRole('alert')
    expect(reset).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Name *')).toHaveValue('রূপম দাস')
    complete()
    await screen.findByText('Message received.')
    const [first, second] = bodies(fetch)
    expect(first.submissionId).toMatch(UUID)
    expect(second.submissionId).toBe(first.submissionId)
    expect(second.cfTurnstileResponse).toBe('fresh-token')
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus())
  })

  it('uses a new reference after the server reports the reference belongs to another brief', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'This reference was already used for a different brief.' }), { status: 409 }))
      .mockImplementation(echoReceipt)
    vi.stubGlobal('fetch', fetch)
    renderRegional()
    complete()
    await screen.findByRole('alert')
    complete()
    await screen.findByText('Message received.')
    const [first, second] = bodies(fetch)
    expect(second.submissionId).toMatch(UUID)
    expect(second.submissionId).not.toBe(first.submissionId)
  })

  it('sends only the city and timeline to analytics', async () => {
    const gtag = vi.fn()
    vi.stubGlobal('gtag', gtag)
    vi.stubGlobal('fetch', echoReceipt)
    renderRegional()
    complete('Shopfront at Hill Cart Road')
    await screen.findByText('Message received.')
    expect(gtag).toHaveBeenCalledWith('event', 'lead_submit', { city: 'Siliguri', timeline: 'unspecified' })
    const sent = JSON.stringify(gtag.mock.calls)
    for (const value of ['রূপম', '9876543210', 'Hill Cart Road']) expect(sent).not.toContain(value)
  })
})

describe('older browsers', () => {
  it('still sends when crypto.randomUUID is missing (Safari before 15.4)', async () => {
    const { getRandomValues } = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: getRandomValues.bind(globalThis.crypto) })
    vi.stubGlobal('fetch', echoReceipt)
    renderRegional()
    complete()
    await screen.findByText('Message received.')
    expect(bodies(echoReceipt)[0].submissionId).toMatch(UUID)
  })

  it('still sends when AbortSignal.timeout is missing (Safari before 16)', async () => {
    const timeout = AbortSignal.timeout
    Object.defineProperty(AbortSignal, 'timeout', { value: undefined, configurable: true, writable: true })
    try {
      vi.stubGlobal('fetch', echoReceipt)
      renderRegional()
      complete()
      await screen.findByText('Message received.')
    } finally {
      Object.defineProperty(AbortSignal, 'timeout', { value: timeout, configurable: true, writable: true })
    }
  })
})
