import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <div
      className={`border-2 border-ink bg-paper-elevated ${elevated ? "shadow-[6px_6px_0_0_var(--ink)]" : ""} ${className}`}
    >
      {children}
    </div>
  )
}
