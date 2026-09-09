import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  className?: string
  priority?: boolean
}

/** The supplied AD-JEET artwork is the only wordmark rendered by the site. */
export function BrandLogo({ className = '', priority = false }: BrandLogoProps) {
  return (
    <Link href="/" aria-label="AD JEET home" className={`brand-logo ${className}`}>
      <Image
        src="/brand/adjeet-original.png"
        alt="AD JEET, since 1990"
        width={586}
        height={175}
        priority={priority}
        sizes="(max-width: 380px) 150px, (max-width: 767px) 176px, 200px"
      />
    </Link>
  )
}
