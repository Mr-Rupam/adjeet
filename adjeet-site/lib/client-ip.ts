import { isIPv4, isIPv6 } from 'node:net'

/** An IP address with any brackets and zone id removed, or null when it is not one. */
function cleanIp(raw: string): string | null {
  let ip = raw.trim()
  if (ip.startsWith('[') && ip.includes(']')) ip = ip.slice(1, ip.indexOf(']'))
  const zone = ip.indexOf('%')
  if (zone !== -1) ip = ip.slice(0, zone)
  return isIPv4(ip) || isIPv6(ip) ? ip : null
}

/** The eight 16-bit groups of a valid IPv6 address. */
function ipv6Groups(ip: string): number[] {
  let text = ip.toLowerCase()
  // A dotted IPv4 tail stands for the last two groups.
  const tail = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(text)
  if (tail) {
    const [a, b, c, d] = tail.slice(1).map(Number)
    text = `${text.slice(0, tail.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`
  }
  const [head, rest] = text.split('::')
  const before = head ? head.split(':') : []
  const after = rest ? rest.split(':') : []
  const gap = rest === undefined ? 0 : 8 - before.length - after.length
  return [...before, ...Array<string>(gap).fill('0'), ...after].map(group => parseInt(group, 16))
}

/**
 * The key a rate limiter counts a visitor under.
 *
 * An IPv4 address is its own key. An IPv6 address is reduced to its /64
 * prefix: a home, office or mobile connection is normally handed a whole /64,
 * so keying on the full address would give one visitor 2^64 separate budgets.
 * An IPv4-mapped IPv6 address (`::ffff:203.0.113.7`) is the IPv4 address
 * underneath it, so the two spellings of one visitor share one budget.
 *
 * Returns null for anything that is not an IP address.
 */
export function rateKey(raw: string): string | null {
  const ip = cleanIp(raw)
  if (!ip || isIPv4(ip)) return ip
  const groups = ipv6Groups(ip)
  const mapped = groups.slice(0, 5).every(group => group === 0) && groups[5] === 0xffff
  if (mapped) return `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`
  return `${groups.slice(0, 4).map(group => group.toString(16).padStart(4, '0')).join(':')}::/64`
}

/**
 * The address of the visitor who sent this request, or null when the request
 * carries no valid one. Vercel sets both headers itself and replaces anything
 * the visitor sent, so they can be trusted there. Run behind another proxy,
 * they would need re-checking.
 */
export function clientIp(headers: Pick<Headers, 'get'>): string | null {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]
  return cleanIp(headers.get('x-real-ip') ?? '') ?? cleanIp(forwarded ?? '')
}
