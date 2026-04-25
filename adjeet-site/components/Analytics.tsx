'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { GA_ID } from '@/lib/analytics'

export function Analytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    function check() {
      setConsented(localStorage.getItem('adjeet-consent') === 'accepted')
    }
    check()
    window.addEventListener('adjeet:consent', check)
    return () => window.removeEventListener('adjeet:consent', check)
  }, [])

  if (!GA_ID || !consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}
