import type React from 'react'
import { buildLocalBusinessJsonLd } from '@/lib/seo'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const schema = buildLocalBusinessJsonLd()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  )
}
