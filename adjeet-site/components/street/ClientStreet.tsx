import Link from 'next/link'
import { clientSlug, getPhotosByClient } from '@/content/gallery'
import styles from './ClientStreet.module.css'

interface Client {
  name: string
  sector: string
  /** Portfolio brand filter, when the gallery files the work under another name. */
  portfolio?: string
}

const ROW_1: Client[] = [
  { name: 'Airtel', sector: 'Telecom' },
  { name: 'Supreme Pipe', sector: 'Piping' },
  { name: 'Havells', sector: 'Electricals' },
  { name: 'Star Cement', sector: 'Cement' },
  { name: 'SRMB', sector: 'Steel' },
  { name: 'Shyam Steel', sector: 'Steel' },
  { name: 'Emami', sector: 'FMCG' },
  { name: 'OYO', sector: 'Hospitality' },
  { name: 'Dalmia Cement', sector: 'Cement' },
  { name: 'Jio', sector: 'Telecom' },
]

const ROW_2: Client[] = [
  { name: 'Vivo', sector: 'Smartphones' },
  { name: 'Toptech TMT', sector: 'Steel' },
  { name: 'Captain TMT Bar', sector: 'Steel' },
  { name: 'Supershakti', sector: 'Steel' },
  { name: 'Elegant TMT Bar', sector: 'Steel' },
  { name: 'Astral Pipe', sector: 'Piping' },
  { name: 'SEL TMT', sector: 'Steel' },
  { name: 'Adani Cement', sector: 'Cement', portfolio: 'acc' },
  { name: 'Anchor', sector: 'Electricals', portfolio: 'anchor-by-panasonic' },
  { name: 'SD Lion TMT', sector: 'Steel' },
  { name: 'Dish TV', sector: 'DTH' },
]

export function ClientStreet() {
  return (
    <section id="client-history" className={styles.clients} aria-labelledby="client-history-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 id="client-history-heading">Brands we’ve worked with.</h2>
          <p>National names. Local craftsmanship.</p>
        </div>
        <ul className={styles.names} aria-label="Past clients">
          {[...ROW_1, ...ROW_2].map(client => {
            const slug = client.portfolio ?? clientSlug(client.name)
            const count = getPhotosByClient(slug).length
            return (
              <li key={client.name}>
                {count > 0
                  ? <Link href={'/portfolio?client=' + slug} aria-label={`${client.name}: see ${count} project photo${count === 1 ? '' : 's'}`}>{client.name}</Link>
                  : <span>{client.name}</span>}
              </li>
            )
          })}
        </ul>
        <p className={styles.note}>Partial list: national brands via their regional agencies, plus 400+ local businesses. Underlined names open their project photos.</p>
      </div>
    </section>
  )
}
