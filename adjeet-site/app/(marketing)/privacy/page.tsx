import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { business } from '@/lib/business'

export const metadata: Metadata = {
  ...buildPageMetadata({ title: 'Privacy Policy', description: 'Privacy policy for AD JEET: what the website collects, who handles it, and how to ask for a copy or deletion.', path: '/privacy' }),
  robots: { index: false },
}

const h2 = 'display text-xl text-ink mb-3'

// Every statement here must stay true of the code: app/api/lead/route.ts,
// app/api/chatbot/route.ts, lib/lead-limits.ts and the analytics components.
// Change this page when they change what they collect or where it goes.
export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="display text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
        Privacy Policy
      </h1>
      <p className="mb-12 mt-3 text-sm text-ink-muted">Last updated: 15 November 2026</p>

      <div className="prose prose-sm max-w-2xl space-y-8 text-ink-muted">
        <section>
          <h2 className={h2}>1. Who we are</h2>
          <p>
            This website belongs to {business.name}, a sign-board maker in {business.city}, {business.region}, India.
            The ways to reach us are at the end of this page.
          </p>
        </section>

        <section>
          <h2 className={h2}>2. What the enquiry form collects</h2>
          <p>
            When you send the enquiry form, we store your name, phone number, city, the services you are
            interested in, your timeline, your message, and the best time to call if you choose one.
          </p>
          <p className="mt-2">
            We also store the page you first arrived on (the landing page) and, if the link that brought you
            carried them, its source, medium and campaign labels. We give each enquiry a reference number and
            note the date. The security check token is checked and then thrown away, not stored.
          </p>
          <p className="mt-2">
            We use these details only to answer your enquiry and to keep our business records. We do not sell
            them, and we do not share them with anyone for their marketing.
          </p>
        </section>

        <section>
          <h2 className={h2}>3. Who handles your details</h2>
          <p>These services handle personal data for us:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>MongoDB Atlas</strong> holds our database of enquiries.</li>
            <li><strong>Google Sheets</strong> holds a copy of each enquiry in a spreadsheet our team works from.</li>
            <li><strong>Resend</strong> emails each enquiry to us.</li>
            <li><strong>Twilio</strong> sends each enquiry to our WhatsApp number.</li>
            <li>
              <strong>Cloudflare Turnstile</strong> checks that a person, not a program, sent the form. It
              receives your network (IP) address and information about your browser.
            </li>
            <li>
              <strong>Upstash</strong> counts enquiries and chat messages so the site cannot be flooded. It
              stores a one-way code made from your network address, and for enquiries from your phone number,
              never the address or number itself. These counts delete themselves within about two days.
            </li>
            <li><strong>OpenAI</strong> writes the chat assistant&apos;s replies (see section 4).</li>
            <li>
              <strong>Vercel</strong> hosts this website, so it handles every request to it, including your
              network address.
            </li>
            <li>Google Analytics, Vercel Web Analytics and Vercel Speed Insights measure visits (see section 5).</li>
          </ul>
          <p className="mt-2">
            Some of these companies are based outside India, so your details may be handled outside India.
          </p>
        </section>

        <section>
          <h2 className={h2}>4. The chat assistant</h2>
          <p>
            Messages you type in the chat assistant are sent to OpenAI, an AI provider, so it can write a reply.
            This website does not save your chat. OpenAI handles the messages under its own terms.
          </p>
          <p className="mt-2">
            Please do not type personal details such as your phone number, address or payment details in the
            chat. To send us your details, use the enquiry form or WhatsApp.
          </p>
        </section>

        <section>
          <h2 className={h2}>5. Analytics</h2>
          <p>
            We use Google Analytics 4 with Google Consent Mode to understand how visitors use this site. Until you
            make a choice in the consent banner, Google Analytics runs without cookies or identifiers and sends
            only anonymous signals, such as a page being viewed, which Google may use for aggregated, modelled
            reports. Analytics cookies are set only if you accept. If you decline, Google Analytics is switched
            off. Advertising storage and ad personalisation are always off. You can change your choice at any
            time by clearing your browser storage for this site. We do not use analytics data to identify
            individual visitors.
          </p>
          <p className="mt-2">
            We also use Vercel Web Analytics, provided by our hosting company, to count page views in
            aggregate. It sets no cookies, stores no identifiers and does not track you across sites, so it
            runs for every visitor regardless of the consent banner.
          </p>
          <p className="mt-2">
            Vercel Speed Insights, from the same provider, measures how quickly pages load and respond (Core
            Web Vitals) during real visits. It sets no cookies and stores no identifiers, and it also runs for
            every visitor.
          </p>
        </section>

        <section>
          <h2 className={h2}>6. WhatsApp and maps</h2>
          <p>
            Clicking a WhatsApp button opens WhatsApp (web or app) with a pre-filled message. Any conversation
            after that is covered by WhatsApp&apos;s own privacy policy. We receive only what you choose to send
            us there.
          </p>
          <p className="mt-2">
            The map on the contact page is loaded from Google Maps, which receives your network address when it
            loads.
          </p>
        </section>

        <section>
          <h2 className={h2}>7. How long we keep your details</h2>
          <p>
            We keep enquiry details while we need them to answer your enquiry and for our business records.
            Copies can also be in our email inbox, our WhatsApp chats and the spreadsheet. We delete your
            details on request, from our database and the spreadsheet.
          </p>
        </section>

        <section>
          <h2 className={h2}>8. Asking for a copy or deletion</h2>
          <p>
            You can ask us for a copy of the details we hold about you, ask us to correct them, or ask us to
            delete them. Contact us in any of these ways:
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>WhatsApp or phone: {business.phoneDisplay}</li>
            <li>Email: <a href={`mailto:${business.email}`} className="underline underline-offset-2">{business.email}</a></li>
            <li>In person or by post: {business.office}, {business.city} {business.officePostalCode}, {business.region}</li>
          </ul>
        </section>

        <section>
          <h2 className={h2}>9. Security</h2>
          <p>
            This website uses HTTPS, so details you send travel encrypted. No system is completely secure, so
            please send us only what we need to answer your enquiry.
          </p>
        </section>

        <section>
          <h2 className={h2}>10. Changes</h2>
          <p>
            We update this page when the website changes what it collects or who handles it. The date at the
            top shows the latest change.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4">← Back to home</Link>
      </div>
    </section>
  )
}
