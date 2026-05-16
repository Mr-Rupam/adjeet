import Link from 'next/link'
import styles from './SectionLabel.module.css'

interface SectionLabelProps {
  number: string
  label: string
  href?: string
  linkText?: string
}

export function SectionLabel({ number, label, href, linkText }: SectionLabelProps) {
  return (
    <div className={`mx-auto max-w-content px-6 py-4 flex items-center justify-between ${styles.container}`}>
      <span className={styles.label}>
        № {number} — {label}
      </span>
      {href && linkText && (
        <Link href={href} className={styles.link}>
          {linkText}
        </Link>
      )}
    </div>
  )
}
