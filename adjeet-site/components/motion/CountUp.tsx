'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({ to, from = 0, duration = 1.2, suffix = '', className }: CountUpProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    if (reduced || !inView) return
    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v: number) => setDisplay(Math.round(v)),
    })
    return () => controls?.stop()
  }, [reduced, inView, from, to, duration])

  if (reduced) {
    return (
      <span ref={ref} role="status" aria-label={`${to}${suffix}`} className={className}>
        {to}{suffix}
      </span>
    )
  }

  return (
    <span ref={ref} role="status" aria-label={`${to}${suffix}`} className={className}>
      {display}{suffix}
    </span>
  )
}
