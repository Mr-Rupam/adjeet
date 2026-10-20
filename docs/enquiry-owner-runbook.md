# AD JEET website enquiries: owner and maintainer runbook

Status on 20 October 2026: the code below is covered by automated tests that use stand-ins for MongoDB, Google Sheets, Resend, Twilio, Upstash and Cloudflare. Production delivery has not been verified with a real enquiry. Do the controlled check in "After each deploy" before relying on it.

A form success screen is a receipt, not a confirmed job. A WhatsApp click is intent to open WhatsApp, not a delivered message.

## How a form enquiry is recorded

- The visitor sees "Message received." only after MongoDB (`adjeet.leads`) or the private Google Sheet acknowledges the complete brief. Email and WhatsApp notifications never decide this.
- If neither store confirms, the visitor sees "We could not confirm that your enquiry reached us", keeps everything they typed, and gets a WhatsApp link prefilled with their town and service. The site answers within about 6 seconds even when a provider hangs.
- Every enquiry has a reference, shown to the visitor on the success screen (and on the failure message when the outcome is uncertain). In MongoDB the document `_id` is `web:` followed by the reference, and the `receiptId` field holds the reference itself. In the Sheet it is the `Enquiry ID` column.
- A retry of the same brief (for example after a lost connection) reuses the reference. MongoDB recognises it, so the retry does not create a second record, a second Sheet row or a second notification. If MongoDB is down during both attempts, the Sheet can hold two rows with the same reference: treat them as one enquiry.
- An edited brief gets a new reference. The earlier, uncertain attempt stays distinguishable.

### The Google Sheet

- With no new settings the website writes to the first tab of the Sheet in `GOOGLE_SHEET_ID`, exactly as the previous code did. `GOOGLE_LEADS_WORKSHEET_TITLE` is an optional override naming a different tab.
- Values go under the header of the same name, ignoring case and extra spaces, so columns can be moved and owner columns added anywhere.
- The previous code filled `Date`, `Name`, `Phone`, `City`, `Services`, `Timeline` and `Message`. These still fill as before. The website now also fills `Enquiry ID`, `Landing page`, `Source`, `Medium`, `Campaign` and `Status`.
- One-time change, automatic: on the first enquiry after this release, any of those headers that the tab lacks are written into row 1 after the last existing header cell. Nothing else in the Sheet is changed. If that write fails, the row still goes into the existing columns and the deploy log names the columns it could not fill. To make the change yourself instead, add those six headers to row 1 before the release, in any position.
- A tab without a `Phone` header is never written to.
- The Sheet counts as a receipt only when every part of the brief (`Name`, `Phone`, `City`, `Services`, `Timeline`, `Message`) has a column.
- Values are stored as plain text. Any cell that begins with `=`, `+`, `-`, `@`, `|`, `%` or a tab gets a leading apostrophe, so an export opened in Excel cannot run it as a formula. The apostrophe is visible in the Sheet; it is not part of what the visitor typed.

### Notifications

- After a confirmed receipt the owner gets an email (Resend) and a WhatsApp message (Twilio), when those are configured. A failed notification does not change the receipt; check the stores, not the inbox.
- When nothing could be saved, the same notification is still sent, marked `NOT CONFIRMED`, so the enquiry can be followed up. Search the stores for its reference before treating it as lost: a slow store can save after the site has answered.
- At most 3 notifications per phone number in 24 hours. Later enquiries from that number are still stored, without a notification. The limit is kept in Upstash under a hash of the number, not the number itself.
- Resend still sends from `onboarding@resend.dev` unless `LEAD_EMAIL_FROM` is set to an address on a domain verified in Resend. The sandbox sender only delivers to the Resend account owner.

### Abuse protection

- Cloudflare Turnstile gates every submission. With a live secret key the site also checks that the token was solved on adjeet.in (or another allowed origin).
- Upstash allows 5 enquiries an hour per IP address. If Upstash is missing, slow or failing, enquiries are allowed and the log says so; Turnstile still applies. A lost enquiry costs more than some extra spam.

## Before relying on the form

- Name the person who acknowledges, qualifies and follows up enquiries, and who covers absence. Agree an internal response target before any response time is published. None is promised on the site.
- Confirm the owner can see MongoDB records if the Sheet copy is missing. If only the Sheet is used day to day, name a maintainer who checks MongoDB for references missing from the Sheet.
- Share the Sheet only with the service account and named staff. Use a MongoDB user limited to insert and find on `adjeet.leads`.

## After each deploy that touches the form: one controlled check

The owner (not an automated test) sends one enquiry:

1. On a phone, open https://adjeet.in/contact and send a brief from your own number, name "Owner test", message "Controlled test, please ignore".
2. Note the enquiry reference on the success screen.
3. MongoDB Atlas, database `adjeet`, collection `leads`: find `{ _id: "web:<reference>" }`. Check the name, phone, city, services, timeline, message, `source` and `stage: "received"`.
4. The Sheet: search for the reference. Check the row and, on the first enquiry after this release, the added headers.
5. Check the email and WhatsApp notification arrived.
6. Vercel, function logs for `/api/lead`: the line `[lead:<reference>] mongo=saved sheets=saved ms=...`. Any other outcome names the store and a short error category.
7. Set the test row's Status to `spam` and leave it out of reporting.

## Reading the log line

| Log text | Meaning | Action |
| --- | --- | --- |
| `mongo=saved sheets=saved` | Both stores have it | None |
| `sheets=saved(no column: ...)` | Saved; those columns could not be filled | Add the named headers |
| `sheets=failed:http-403` or `missing-columns` | Sheet not written; MongoDB has it | Check sharing, tab and `Phone` header; copy the record into the Sheet |
| `mongo=failed:...` | Only the Sheet has it | Check `MONGODB_URI` and Atlas |
| `NOT CONFIRMED` | Neither store confirmed | Urgent: follow up from the notification, fix the stores |
| `Owner notification failed` | Saved, but email or WhatsApp failed | Check Resend or Twilio |
| `Owner notification skipped` | That number hit the daily notification cap | Look in the stores |
| `rate limiter unavailable, allowing` | Upstash failing; enquiries still accepted | Check Upstash |

Logs never contain names, phone numbers or messages.

## At each enquiry

1. Find the reference first. Reconcile Sheet rows with the same reference as one enquiry, keeping the first received date. Do not delete a different brief only because the phone number matches.
2. Set Owner, Next action and Next action date. The website sets Status to `received`.
3. Confirm the shop location, the kind of sign (or that they need advice: `help-choosing`), approximate size and site constraints, and the target date. Timeline `unspecified` means the visitor gave no date. It does not mean urgent.
4. Use one set of statuses: `received`, `contacted`, `qualified`, `quoted`, `won`, `lost`, `spam`. Record the reason for `lost` and `spam`.
5. Record first response, quote reference and date, and the confirmed job when there is one. Mark `won` only after the business confirms the job.
6. Leave a next action on every open enquiry and check overdue ones at the start and end of each working day.

## Recovery

- A visitor unsure whether a submission went through: search their reference before asking them to send again.
- WhatsApp or phone enquiries: add them to the Sheet by hand with a manual reference, so all channels are counted once.
- Never put customer rows, screenshots, exports or credentials in the repository or in analytics. Analytics receives only the city and timeline of a confirmed enquiry.
