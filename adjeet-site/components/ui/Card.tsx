import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-paper-elevated border border-rule ${elevated ? 'shadow-lg' : 'shadow-md'} ${className}`}
    >
      {children}
    </div>
  )
}
