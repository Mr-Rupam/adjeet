'use client'
import { useEffect } from 'react'
import { captureLeadSource } from '@/lib/lead-source'

export function LeadSourceCapture() {
  useEffect(() => { captureLeadSource() }, [])
  return null
}
