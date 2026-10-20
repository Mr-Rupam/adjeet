import { JWT } from 'google-auth-library'

/*
 * The writer reads the Sheet's own header row and puts each value under the
 * header of the same name (ignoring case and spacing), so the owner can move
 * columns or add working columns of their own.
 *
 * The production Sheet was set up for the previous google-spreadsheet writer,
 * which used the FIRST tab and filled Date, Name, Phone, City, Services,
 * Timeline and Message. With no new settings that tab is still used, its
 * columns keep their order, and any column the row carries that the header
 * lacks (Enquiry ID, Landing page and so on) is added after the last header
 * cell the first time it is needed. GOOGLE_LEADS_WORKSHEET_TITLE only
 * overrides the tab.
 */

/**
 * Every field the visitor typed or chose. A row counts as a receipt only when
 * all of them landed in a column. A new optional form field does not belong
 * here: its column is added like any other new column.
 */
const BRIEF_HEADERS = ['Name', 'Phone', 'City', 'Services', 'Timeline', 'Message']

/** Without a phone column a row cannot be acted on, so it is not written at all. */
const CALLBACK_HEADER = 'Phone'

export type SheetRow = Record<string, string>
export type SheetOutcome =
  /** Google acknowledged the row and the whole brief had a column. `missing` lists unfilled extra columns. */
  | { status: 'saved'; missing: string[] }
  /** Google acknowledged the row, but part of the brief had no column. A backup, not a receipt. */
  | { status: 'partial'; missing: string[] }
  | { status: 'failed'; reason: string }
export type LeadSheet =
  | { ready: true; append: (row: SheetRow, signal?: AbortSignal) => Promise<SheetOutcome> }
  | { ready: false; outcome: SheetOutcome }

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets/'
const normalise = (header: unknown) => (typeof header === 'string' ? header.trim().replace(/\s+/g, ' ').toLowerCase() : '')

// RAW writes never run a formula inside Sheets, but a CSV export opened in
// Excel would. Look past leading spaces and invisible characters (zero-width,
// direction marks, word joiner, soft hyphen, BOM), then prefix a visible
// apostrophe to anything a spreadsheet would treat as a formula.
const LEADING_INVISIBLE = /^[\s​-‏⁠﻿­]+/
const FORMULA_TRIGGERS = /^[=+\-@\t\r|%]/
const formulaSafe = (value: string) =>
  (FORMULA_TRIGGERS.test(value) || FORMULA_TRIGGERS.test(value.replace(LEADING_INVISIBLE, '')) ? `'${value}` : value)

/** The title of the tab at index 0, as google-spreadsheet's `sheetsByIndex[0]` chose it. */
function firstTab(info: { sheets?: { properties?: { title?: unknown; index?: unknown } }[] }): string | undefined {
  const tabs = (info.sheets ?? []).flatMap(sheet => {
    const { title, index } = sheet.properties ?? {}
    return typeof title === 'string' ? [{ title, index: typeof index === 'number' ? index : 0 }] : []
  })
  return tabs.sort((a, b) => a.index - b.index)[0]?.title
}

/** 0 is A, 25 is Z, 26 is AA. */
function columnName(index: number) {
  let name = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name
  return name
}
const failed = (reason: string): SheetOutcome => ({ status: 'failed', reason })
const unready = (reason: string): LeadSheet => ({ ready: false, outcome: failed(reason) })

class SheetHttpError extends Error {
  constructor(readonly status: number) { super(`http-${status}`) }
}
function reasonFor(error: unknown) {
  if (error instanceof SheetHttpError) return error.message
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) return 'timeout'
  return 'error'
}

/**
 * Resolve the worksheet and read its header row, so the append that follows
 * is one request. Never rejects: failures come back as `{ ready: false }`
 * with a category that is safe to log.
 */
export async function openLeadSheet(signal: AbortSignal = AbortSignal.timeout(3000)): Promise<LeadSheet> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const id = process.env.GOOGLE_SHEET_ID
  if (!email || !key || !id) return unready('unconfigured')
  try {
    const auth = new JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'], transporterOptions: { timeout: 2000, retry: false, signal } })
    const { token } = await auth.getAccessToken()
    if (!token) return unready('auth')
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    const base = SHEETS_API + encodeURIComponent(id)
    const get = async (url: string) => {
      const response = await fetch(url, { headers, signal, cache: 'no-store' })
      if (!response.ok) throw new SheetHttpError(response.status)
      return response.json()
    }

    // The previous writer always used the first tab. Keep doing that unless a
    // tab is named, so a deploy cannot quietly move or stop the backup.
    const title = process.env.GOOGLE_LEADS_WORKSHEET_TITLE?.trim()
      || firstTab(await get(`${base}?fields=${encodeURIComponent('sheets.properties(title,index)')}`))
    if (!title) return unready('no-worksheet')
    const range = `'${title.replace(/'/g, "''")}'`
    const header: unknown = (await get(`${base}/values/${encodeURIComponent(`${range}!1:1`)}`)).values?.[0]
    const columns = Array.isArray(header) ? header.map(normalise) : []
    if (!columns.includes(normalise(CALLBACK_HEADER))) return unready('missing-columns')

    return {
      ready: true,
      async append(row, appendSignal = signal) {
        try {
          let filled = columns
          let missing = Object.keys(row).filter(name => !columns.includes(normalise(name)))
          if (missing.length) {
            // The API trims trailing blank cells, so these cells are empty.
            const cells = `${range}!${columnName(columns.length)}1:${columnName(columns.length + missing.length - 1)}1`
            const extended = await fetch(`${base}/values/${encodeURIComponent(cells)}?valueInputOption=RAW`, {
              method: 'PUT', headers, signal: appendSignal, body: JSON.stringify({ values: [missing] }),
            })
            // If the header cannot be extended, the row still goes into the columns that exist.
            if (extended.ok) { filled = [...columns, ...missing.map(normalise)]; missing = [] }
          }
          const values = new Map(Object.entries(row).map(([name, value]) => [normalise(name), formulaSafe(value)]))
          const used = new Set<string>()
          // A duplicated header gets the value once, in its first column.
          const cells = filled.map(column => {
            if (!column || used.has(column) || !values.has(column)) return ''
            used.add(column)
            return values.get(column) ?? ''
          })
          // RAW stores values literally. OVERWRITE fills the next empty row, as
          // google-spreadsheet's addRow did. No retry: an interrupted append
          // may already have been saved.
          const response = await fetch(`${base}/values/${encodeURIComponent(`${range}!A1`)}:append?valueInputOption=RAW&insertDataOption=OVERWRITE`, {
            method: 'POST', headers, signal: appendSignal, body: JSON.stringify({ values: [cells] }),
          })
          if (!response.ok) return failed(`http-${response.status}`)
          if ((await response.json()).updates?.updatedRows !== 1) return failed('not-acknowledged')
          const briefComplete = BRIEF_HEADERS.every(name => filled.includes(normalise(name)) && values.has(normalise(name)))
          return { status: briefComplete ? 'saved' : 'partial', missing }
        } catch (error) {
          return failed(reasonFor(error))
        }
      },
    }
  } catch (error) {
    return unready(reasonFor(error))
  }
}

/** Open the Sheet and append one row. */
export async function appendToSheet(row: SheetRow, signal: AbortSignal = AbortSignal.timeout(3000)): Promise<SheetOutcome> {
  const sheet = await openLeadSheet(signal)
  return sheet.ready ? sheet.append(row, signal) : sheet.outcome
}
