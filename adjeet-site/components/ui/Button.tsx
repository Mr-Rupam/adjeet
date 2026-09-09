import Link from 'next/link'
import { type ComponentPropsWithoutRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'border-2 border-ink bg-signal text-signal-ink font-bold shadow-[4px_4px_0_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--ink)]',
  secondary: 'border-2 border-ink text-ink hover:bg-ink hover:text-paper',
  ghost: 'text-ink-muted hover:text-ink',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-4 py-2 text-[11px] uppercase tracking-[0.08em]',
  md: 'px-6 py-3 text-[13px] uppercase tracking-[0.08em]',
  lg: 'px-8 py-4 text-sm uppercase tracking-[0.08em]',
}

const BASE = 'inline-flex items-center justify-center gap-2 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-50 disabled:pointer-events-none'

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
  children: React.ReactNode
}

type ButtonProps =
  | (ButtonBaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | (ButtonBaseProps & { href: string; target?: string; rel?: string; children: React.ReactNode })

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`

  if ('href' in props && props.href) {
    const { href, target, rel, children } = props as { href: string; target?: string; rel?: string; children: React.ReactNode }
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    )
  }

  const { children, ...rest } = props as ComponentPropsWithoutRef<'button'> & ButtonBaseProps
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
