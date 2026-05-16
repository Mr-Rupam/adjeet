import Link from 'next/link'
import styles from './SectionLabel.module.css'

interface SectionLabelProps {
  number?: string
  label: string
  href?: string
  linkText?: string
  invert?: boolean
}

export function SectionLabel({ number, label, href, linkText, invert }: SectionLabelProps) {
  return (
    <div className={`mx-auto max-w-content px-6 py-4 flex items-center justify-between ${invert ? styles.containerInvert : styles.container}`}>
      <span className={invert ? styles.labelInvert : styles.label}>
        {number ? `№ ${number} — ${label}` : label}
      </span>
      {href && linkText && (
        <Link href={href} className={invert ? styles.linkInvert : styles.link}>
          {linkText}
        </Link>
      )}
    </div>
  )
}
