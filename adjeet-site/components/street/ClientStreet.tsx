import styles from './ClientStreet.module.css'

interface Client {
  name: string
  sector: string
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
  { name: 'Adani Cement', sector: 'Cement' },
  { name: 'Anchor', sector: 'Electricals' },
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
          {[...ROW_1, ...ROW_2].map(client => (
            <li key={client.name}><span>{client.name}</span></li>
          ))}
        </ul>
        <p className={styles.note}>Partial list: national brands via their regional agencies, plus 400+ local businesses.</p>
      </div>
    </section>
  )
}
