import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

export function CommissionCTA() {
  return (
    <section className="commission" aria-labelledby="enquiry-heading">
      <div className="field-container commission-inner">
        <div><p className="spec">Your next project starts here</p><h2 id="enquiry-heading">What are we putting<br />your name on?</h2></div>
        <div className="commission-actions"><p>A photo. A place. An idea.<br />Send what you have. We&apos;ll take it from there.</p><QuoteCTA source="commission-cta" label="WhatsApp your project" /><Link href="/contact" className="field-link">Or send a project brief <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </section>
  )
}
