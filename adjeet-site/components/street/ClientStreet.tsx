/**
 * Two counter-scrolling rows of client names — the street of brands whose
 * signs we've built. Pure CSS marquee (tokens.css --animate-marquee).
 */

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

function MarqueeRow({ clients, reverse }: { clients: Client[]; reverse?: boolean }) {
  const strip = (ariaHidden: boolean, key: string) => (
    <div
      key={key}
      aria-hidden={ariaHidden || undefined}
      className={`flex shrink-0 items-baseline animate-marquee [--duration:45s] [--gap:0px] motion-reduce:animate-none ${
        reverse ? '[animation-direction:reverse]' : ''
      }`}
    >
      {clients.map(c => (
        <span key={c.name} className="flex items-baseline gap-3 whitespace-nowrap px-6">
          <span className="display text-4xl text-ink transition-colors md:text-5xl">
            {c.name}
          </span>
          <span className="spec text-ink-subtle">{c.sector}</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="flex overflow-hidden py-3">
      {strip(false, 'a')}
      {strip(true, 'b')}
      {strip(true, 'c')}
    </div>
  )
}

export function ClientStreet() {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink bg-paper py-14 md:py-20">
      <div className="mx-auto max-w-content px-5 md:px-8">
        <p className="spec text-signal">The client street</p>
        <h2 className="display mt-3 max-w-3xl text-ink" style={{ fontSize: 'var(--text-display-2)' }}>
          Every brand below has a sign in North Bengal{' '}
          <span className="text-signal">that we built.</span>
        </h2>
      </div>

      <div className="mt-10 -rotate-1 md:mt-14">
        <div className="border-y-2 border-ink bg-paper-elevated">
          <MarqueeRow clients={ROW_1} />
        </div>
        <div className="border-b-2 border-ink bg-paper">
          <MarqueeRow clients={ROW_2} reverse />
        </div>
      </div>

      <p className="spec mx-auto mt-10 max-w-content px-5 text-ink-subtle md:px-8">
        Partial list — national brands via their regional agencies, plus 400+ local businesses.
      </p>
    </section>
  )
}
