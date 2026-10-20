# Lead receipt implementation notes

Plan: `output/adjeet-website-strategy-20260928.md`, sections "Protect every genuine enquiry", "Failure modes registry" and "Implementation tasks proposed from the review" (T1 to T3, T5 data handling, T6 tests).
Security input: `output/overnight-20261020/security/SECURITY.md`, lead route items S2, S5, S7, S11, S13, S16.

Codex implemented the first version in the uncommitted worktree `local-shopfront-enquiries` (based on a9c240a, 12 October 2026). It was ported on 20 October 2026 to branch `claude/lead-receipt`, reviewed and changed as below. The homepage gallery, regional page copy and DESIGN.md parts of that worktree belong to other changes and are not here.

Production delivery has not been verified with a real enquiry. Every automated test uses stand-ins for the providers. `docs/enquiry-owner-runbook.md` has the controlled check the owner does after deploy.

## Final behaviour

- Receipt: success only after an acknowledged MongoDB insert, or a Sheet row holding the whole brief. Email and WhatsApp run after the response with `after()` and never decide it.
- Deadline: the visitor gets an answer within 6 seconds (`lib/lead-deadline.ts`). MongoDB and the Sheet run in parallel; MongoDB has a 3 second share so a stalled database still leaves the Sheet time to append. The per-phone cap check and notifications after the response fit inside the route's `maxDuration` of 10 seconds, which a unit test enforces.
- Reference: the form sends a UUID per brief (`lib/lead-brief.ts`, with a fallback for browsers without `crypto.randomUUID`). MongoDB stores it as `_id: web:<id>` with a hash of the brief. A retry of the same brief is answered as a success without a second record, Sheet row or notification. A reused reference with a different brief gets 409 and the form starts a new reference.
- Sheet: native Sheets API through the existing `google-auth-library`, replacing `google-spreadsheet`, whose request timeout exceeded the route budget. Writes to the first tab by default, as before; `GOOGLE_LEADS_WORKSHEET_TITLE` only overrides it. Values follow the existing header row by name; missing website columns are added after the last header; `insertDataOption=OVERWRITE` as the old `addRow` used; RAW values with an apostrophe before formula-like text.
- Limiter: 5 per hour per IP and 3 owner notifications per day per phone (hashed), both on the existing Upstash database, both failing open with a sanitised warning.
- Turnstile: verified within 2 seconds; with a live secret the solved hostname must be one of the allowed origins.
- Names: letters and marks in any script, plus space, dot, hyphen, apostrophe and the Bengali joiners. No digits, links or control characters (CR, LF, tab).
- Form: unspecified urgency by default, a "help choosing" option, an optional "Best time to call" request (Morning, Afternoon, Evening, Any time; unselected sends nothing; stored and shown to the owner, never sent to analytics), a draft kept on any failure, a fresh CAPTCHA token for each retry, the reference shown when receipt is uncertain, and only city and timeline sent to analytics on a confirmed receipt.
- Source labels: allowlisted landing page and UTM labels held in page memory only, stored with the enquiry, never free text.
- MongoDB: a rejected first connection is not cached.

## Review changes to the Codex version

- The Sheets writer required a new setting and a new header row, so with production's current settings it would have written nothing. It now defaults to the old tab and header order, and extends the header itself.
- Limiter failures returned 503; now fail open (Turnstile still gates). Missing configuration in production returned 503 for every enquiry; now allowed with a warning, as before.
- `crypto.randomUUID()` was called outside the error handling, so on Safari before 15.4 the form could never send. `AbortSignal.timeout` broke sending on Safari before 16. Both replaced.
- Mongo and the Sheet ran one after the other; now in parallel, with the Sheet waiting for MongoDB's answer only before appending.
- When nothing could be saved the owner was not told; now notified, marked NOT CONFIRMED.
- Logs carry the reference, each store's outcome and an error category; never names, phones, messages or error messages.
- Mongo server selection waited 1.8 seconds while the route allowed 3.

## Verification

Run from `adjeet-site/`, the same commands as CI: `npm run lint`, `npx tsc --noEmit`, `npm test`, `next build` with the CI environment, and Playwright against the production build. Results are in the pull request.

## Not done here

- The `google-spreadsheet` package is no longer imported. Removing it from `package.json` is left to the dependency change.
- IPv6 /64 keying of the per-IP limit (S3), a site-wide daily circuit breaker (S5), a widget `action` check (S7: adding an action now would reject forms on pages cached before the deploy), and the link filter (S12).
- The chatbot route (S1, S2, S8) is handled separately.
