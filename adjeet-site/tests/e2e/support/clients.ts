import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every client name in the homepage's client history, in display order.
 *
 * The list lives only in components/street/ClientStreet.tsx (ROW_1 and ROW_2
 * are not exported, and the component imports a CSS module a spec cannot
 * load), so it is read from the source. Adding a client then needs no change
 * to the specs. A name the pattern cannot read makes the specs that compare
 * against this list fail, so it cannot pass by accident.
 */
export const CLIENT_NAMES = [
  ...readFileSync(join(__dirname, '../../../components/street/ClientStreet.tsx'), 'utf8')
    .matchAll(/\{\s*name:\s*'([^']+)'/g),
].map(match => match[1])
