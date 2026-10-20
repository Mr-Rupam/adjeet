// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('google-auth-library', () => ({ JWT: class { async getAccessToken() { return { token: 'test-token' } } } }))

// The header row the google-spreadsheet writer filled before this change: the
// existing production Sheet was set up for these keys, on its first tab.
const LEGACY = ['Date', 'Name', 'Phone', 'City', 'Services', 'Timeline', 'Message']
const NEW = ['Enquiry ID', 'Landing page', 'Source', 'Medium', 'Campaign', 'Status']
const FULL = [...LEGACY, ...NEW]
const row = {
  'Enquiry ID': 'reference', Date: '2026-10-20T00:00:00.000Z', Name: 'Buyer', Phone: '9876543210', City: 'Siliguri',
  Services: 'glow-sign-boards', Timeline: 'exploring', Message: 'Shopfront', 'Landing page': '/contact',
  Source: 'google', Medium: 'organic', Campaign: 'unknown', Status: 'received',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const tabs = (...titles: string[]) => json({ sheets: titles.map((title, index) => ({ properties: { title, index } })) })
const header = (cells: string[]) => json({ values: [cells] })
const headerWritten = () => json({ updatedCells: 1 })
const appended = (rows = 1) => json({ updates: { updatedRows: rows } })
type Call = [string, { method?: string; body?: string }?]
const calls = (fetch: ReturnType<typeof vi.fn>) => fetch.mock.calls as Call[]
const url = (call: Call) => decodeURIComponent(String(call[0]))
const appendCall = (fetch: ReturnType<typeof vi.fn>) => calls(fetch).find(call => url(call).includes(':append'))!
const appendedValues = (fetch: ReturnType<typeof vi.fn>) => JSON.parse(appendCall(fetch)[1]!.body!).values[0]

beforeEach(() => {
  vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', 'test@example.test')
  vi.stubEnv('GOOGLE_PRIVATE_KEY', 'test-key')
  vi.stubEnv('GOOGLE_SHEET_ID', 'test-sheet')
  vi.stubEnv('GOOGLE_LEADS_WORKSHEET_TITLE', '')
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules() })

describe('the existing production Sheet, with no new settings', () => {
  it('writes to the first tab, as the previous writer did, when no tab title is configured', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Form leads', 'Notes')).mockResolvedValueOnce(header(FULL)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: [] })
    expect(url(calls(fetch)[1])).toContain("'Form leads'!1:1")
    expect(url(appendCall(fetch))).toContain("'Form leads'!A1")
    // google-spreadsheet's addRow default: fill the next empty row, do not insert grid rows.
    expect(url(appendCall(fetch))).toContain('insertDataOption=OVERWRITE')
  })

  it('keeps the legacy column order and adds the new columns after the last header', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(LEGACY))
      .mockResolvedValueOnce(headerWritten()).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: [] })
    const [headerUrl, headerInit] = calls(fetch)[2]
    expect(decodeURIComponent(headerUrl)).toContain("'Sheet1'!H1:M1")
    expect(headerInit?.method).toBe('PUT')
    expect(JSON.parse(headerInit!.body!).values).toEqual([NEW])
    expect(appendedValues(fetch)).toEqual([
      row.Date, 'Buyer', '9876543210', 'Siliguri', 'glow-sign-boards', 'exploring', 'Shopfront',
      'reference', '/contact', 'google', 'organic', 'unknown', 'received',
    ])
  })

  it('still saves the brief in the existing columns when the header cannot be extended', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(LEGACY))
      .mockResolvedValueOnce(json({}, 403)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: NEW })
    expect(appendedValues(fetch)).toEqual([row.Date, 'Buyer', '9876543210', 'Siliguri', 'glow-sign-boards', 'exploring', 'Shopfront'])
  })

  it('uses a configured tab title without reading the tab list', async () => {
    vi.stubEnv('GOOGLE_LEADS_WORKSHEET_TITLE', "Owner's register")
    const fetch = vi.fn().mockResolvedValueOnce(header(FULL)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: [] })
    expect(url(calls(fetch)[0])).toContain("'Owner''s register'!1:1")
  })

  it('matches header cells regardless of case, surrounding spaces and blank cells', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1'))
      .mockResolvedValueOnce(header([' phone ', '', 'NAME', 'city', 'Services', 'timeline', 'Message', 'date', 'enquiry ID', 'Landing Page', 'source', 'medium', 'campaign', 'status']))
      .mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: [] })
    expect(appendedValues(fetch).slice(0, 7)).toEqual(['9876543210', '', 'Buyer', 'Siliguri', 'glow-sign-boards', 'exploring', 'Shopfront'])
  })
})

describe('best time to call column', () => {
  const asked = { ...row, 'Best time to call': 'Evening' }

  it('adds the header after the last one the first time a visitor chooses a time, and fills it', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(FULL))
      .mockResolvedValueOnce(headerWritten()).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(asked)).toEqual({ status: 'saved', missing: [] })
    const [headerUrl, headerInit] = calls(fetch)[2]
    expect(decodeURIComponent(headerUrl)).toContain("'Sheet1'!N1:N1")
    expect(JSON.parse(headerInit!.body!).values).toEqual([['Best time to call']])
    expect(appendedValues(fetch)).toHaveLength(FULL.length + 1)
    expect(appendedValues(fetch).at(-1)).toBe('Evening')
  })

  it('fills the column wherever the owner put it', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1'))
      .mockResolvedValueOnce(header(['Best time to call', ...FULL])).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(asked)).toEqual({ status: 'saved', missing: [] })
    expect(appendedValues(fetch)[0]).toBe('Evening')
    expect(calls(fetch)).toHaveLength(3)
  })

  it('leaves a row without it a complete brief, and does not add the header for it', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(FULL)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'saved', missing: [] })
    expect(calls(fetch)).toHaveLength(3)
    expect(appendedValues(fetch)).toHaveLength(FULL.length)
  })

  it('still counts the row as a receipt when the header cannot be added: it is not part of the brief', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(FULL))
      .mockResolvedValueOnce(json({}, 403)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(asked)).toEqual({ status: 'saved', missing: ['Best time to call'] })
    expect(appendedValues(fetch)).toHaveLength(FULL.length)
  })
})

describe('receipt rules', () => {
  it('appends but does not count as a receipt when part of the brief has no column and none can be added', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(['Date', 'Name', 'Phone']))
      .mockResolvedValueOnce(json({}, 403)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toMatchObject({ status: 'partial', missing: expect.arrayContaining(['City', 'Services', 'Timeline', 'Message']) })
    expect(appendCall(fetch)).toBeDefined()
  })

  it('does not touch a tab without a phone column: it is not the enquiry register', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(['Date', 'Name', 'Notes']))
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'failed', reason: 'missing-columns' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not count an HTTP 200 without an acknowledged appended row as saved', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(FULL)).mockResolvedValueOnce(appended(0)))
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'failed', reason: 'not-acknowledged' })
  })

  it('reports an HTTP failure by status only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"error":{"message":"denied"}}', { status: 403 })))
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'failed', reason: 'http-403' })
  })

  it('reports missing credentials without calling Google', async () => {
    vi.stubEnv('GOOGLE_SHEET_ID', '')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    expect(await appendToSheet(row)).toEqual({ status: 'failed', reason: 'unconfigured' })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('formula safety', () => {
  async function written(values: Partial<typeof row>) {
    const fetch = vi.fn().mockResolvedValueOnce(tabs('Sheet1')).mockResolvedValueOnce(header(FULL)).mockResolvedValueOnce(appended())
    vi.stubGlobal('fetch', fetch)
    const { appendToSheet } = await import('@/lib/google-sheets')
    await appendToSheet({ ...row, ...values })
    expect(String(appendCall(fetch)[0])).toContain('valueInputOption=RAW')
    return appendedValues(fetch)
  }

  it('stores formula-like text with a visible apostrophe, so a CSV export opened in Excel stays text', async () => {
    const message = FULL.indexOf('Message')
    for (const text of ['=HYPERLINK("x")', '+91 board', '-5 boards', '@here', '\tcmd', '|x', '%x', '  =1', '​=1', '‎=1', '⁠=1', '­=1']) {
      expect((await written({ Message: text }))[message]).toBe(`'${text}`)
    }
  })

  it('leaves ordinary text and phone numbers alone', async () => {
    const values = await written({ Message: 'Shopfront, 10 ft' })
    expect(values[FULL.indexOf('Message')]).toBe('Shopfront, 10 ft')
    expect(values[FULL.indexOf('Phone')]).toBe('9876543210')
  })
})
