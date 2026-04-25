import React from 'react'

interface ServiceIconProps {
  icon: string
  size?: number
  className?: string
}

const ICONS: Record<string, React.ReactElement<React.SVGProps<SVGSVGElement>>> = {
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  panels: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <circle cx="6" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="9" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l3 6H3L6 3z" />
      <path d="M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="15" height="11" rx="1" />
      <path d="M16 12h4l2 3v3h-6V12z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" />
    </svg>
  ),
  'paint-roller': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="6" rx="1" />
      <path d="M16 6h3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2" />
      <line x1="9" y1="9" x2="9" y2="14" />
      <rect x="6" y="14" width="6" height="7" rx="1" />
    </svg>
  ),
  'flag-pole': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M12 4l8 4-8 4V4z" fill="currentColor" stroke="none" opacity="0.3" />
      <path d="M12 4l8 4-8 4" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <rect x="9" y="13" width="6" height="7" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth={1.5} />
    </svg>
  ),
  display: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="18" rx="1" />
      <line x1="9" y1="6" x2="15" y2="6" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="12" y2="12" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  ),
}

export function ServiceIcon({ icon, size = 48, className = '' }: ServiceIconProps) {
  const svg = ICONS[icon]
  if (!svg) return null
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      {React.cloneElement(svg, { width: size, height: size })}
    </span>
  )
}
