import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for AD-JEET — how we collect, use, and protect your information.',
  robots: { index: false },
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-20">
      <h1 className="text-3xl font-bold font-serif text-ink mb-2">Privacy Policy</h1>
      <p className="text-xs text-ink-subtle mb-12">Last updated: April 2026</p>

      <div className="prose prose-sm max-w-2xl text-ink-muted space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">1. Information We Collect</h2>
          <p>
            When you submit a contact form on this website, we collect your name, phone number, city, and
            service interest. We use this information solely to respond to your enquiry. We do not sell or
            share your personal data with third parties for marketing purposes.
          </p>
          <p className="mt-2">
            Form submissions are securely stored in our database (MongoDB Atlas) and may be synced to an
            internal spreadsheet (Google Sheets) for our team&apos;s operational use. This data is also
            transmitted to our email provider (Resend) to notify our team of new enquiries.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">2. Analytics</h2>
          <p>
            With your consent, we use Google Analytics 4 to understand how visitors use this site. Analytics
            cookies are only set after you accept via the consent banner. You can withdraw consent at any time
            by clearing your browser storage. We do not use analytics data to identify individual visitors.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">3. WhatsApp</h2>
          <p>
            Clicking a WhatsApp button opens WhatsApp (web or app) with a pre-filled message. Any subsequent
            conversation is governed by WhatsApp&apos;s own privacy policy. We do not receive any data from WhatsApp
            other than what you choose to send us in the chat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">4. Data Retention</h2>
          <p>
            Contact form submissions are stored in our secure database and retained for up to 12 months
            for business correspondence. Copies may exist in our email inbox and internal spreadsheet.
            You may request deletion of all your data by contacting us via WhatsApp or email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">5. Security</h2>
          <p>
            We take reasonable measures to protect your data in transit and at rest. Our website uses HTTPS.
            Contact form data is encrypted in transit and stored in a password-protected, access-controlled
            database (MongoDB Atlas). Email notifications are sent via Resend over encrypted connections.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete personal data we hold about you. To exercise these
            rights, contact us via WhatsApp at +91 98320 11524 or visit our office at Platinum Square, Siliguri.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink mb-3">7. Changes</h2>
          <p>
            We may update this policy from time to time. The &quot;Last updated&quot; date above reflects the most recent
            revision. Continued use of the site after changes constitutes acceptance of the updated policy.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-rule">
        <Link href="/" className="text-sm text-blue hover:underline">← Back to home</Link>
      </div>
    </main>
  )
}
