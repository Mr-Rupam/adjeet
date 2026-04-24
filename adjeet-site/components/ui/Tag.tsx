interface TagProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-paper-elevated text-ink-muted border border-rule ${className}`}>
      {children}
    </span>
  )
}
