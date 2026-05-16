import type React from 'react'
import { buildLocalBusinessJsonLd, jsonLdString } from '@/lib/seo'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const schema = buildLocalBusinessJsonLd()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }}
      />
      {children}
    </>
  )
}
