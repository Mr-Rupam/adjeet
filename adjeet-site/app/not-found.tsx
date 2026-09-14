import Link from 'next/link'
import { PageMasthead } from '@/components/street/PageMasthead'

export default function NotFound() {
  return (
    <PageMasthead
      meta={['A wrong turn', 'Let’s get you back on track']}
      title={<>Page not found.</>}
      lead="This address doesn’t lead to a page. Explore our work, browse the services or head back home."
    >
      <div className="flex flex-wrap gap-x-7 gap-y-3">
        <Link href="/" className="field-link">Back to home ↗</Link>
        <Link href="/services" className="field-link">Our services ↗</Link>
        <Link href="/portfolio" className="field-link">See our work ↗</Link>
      </div>
    </PageMasthead>
  )
}
