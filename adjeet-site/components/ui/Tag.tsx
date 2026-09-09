import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return (
    <span className={`inline-flex items-center border-2 border-ink/25 bg-paper-elevated px-3 py-1 text-[10px] uppercase tracking-[0.08em] text-ink-muted ${className}`}>
      {children}
    </span>
  )
}
