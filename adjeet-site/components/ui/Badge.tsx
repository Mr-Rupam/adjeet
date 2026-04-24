type BadgeVariant = 'default' | 'blue' | 'ochre' | 'success'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-paper-elevated text-ink-muted',
  blue: 'bg-blue text-white',
  ochre: 'bg-ochre text-white',
  success: 'bg-success text-white',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${BADGE_CLASSES[variant]} ${className}`}>
      {children}
    </span>
  )
}
