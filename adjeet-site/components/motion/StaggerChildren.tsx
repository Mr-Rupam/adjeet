'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

const container = (stagger: number) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger },
  },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export function StaggerChildren({ children, staggerDelay = 0.08, className }: StaggerChildrenProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={container(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
