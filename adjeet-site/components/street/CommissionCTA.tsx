import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

export function CommissionCTA() {
  return (
    <section className="commission" aria-labelledby="enquiry-heading">
      <div className="field-container commission-inner">
        <div><h2 id="enquiry-heading">One shopfront, or<br />every outlet you have.</h2></div>
        <div className="commission-actions"><p>Send a photo of your shop, or your outlet list.<br />We will plan the work from there.</p><QuoteCTA source="commission-cta" label="WhatsApp your project" /><Link href="/contact" className="field-link">Or send a project brief <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </section>
  )
}
