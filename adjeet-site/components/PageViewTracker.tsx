'use client'

import { useEffect } from 'react'
import { trackServicePageView, trackProgrammaticView } from '@/lib/analytics'

export function ServicePageTracker({ service }: { service: string }) {
  useEffect(() => {
    trackServicePageView(service)
  }, [service])
  return null
}

export function ProgrammaticPageTracker({ service, city }: { service: string; city: string }) {
  useEffect(() => {
    trackProgrammaticView({ service, city })
  }, [service, city])
  return null
}
