import type { CSSProperties, ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

const style: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.14em',
  color: 'var(--ink-subtle)',
  textTransform: 'uppercase',
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span style={style} className={className}>
      {children}
    </span>
  )
}
