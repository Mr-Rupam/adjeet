import Link from 'next/link'
import { type ComponentPropsWithoutRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:opacity-90',
  secondary: 'border border-ink text-ink hover:bg-paper-elevated',
  ghost: 'text-ink-muted hover:text-ink',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm font-medium',
  lg: 'px-7 py-3.5 text-base font-medium',
}

const BASE = 'inline-flex items-center justify-center rounded transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-50 disabled:pointer-events-none'

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
