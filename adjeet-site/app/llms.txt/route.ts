import { business } from '@/lib/business'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { services } from '@/content/services'

export const dynamic = 'force-static'

// Optional reading aid. Search visibility does not depend on this file.
// Derive contact facts and links from the same records as the website.
export function GET() {
  const lines = [
    `# ${business.name}`,
    '',
    `> Signage, printing and outdoor advertising from ${business.city}, North Bengal. Founded in ${business.foundingYear} by ${business.founder}.`,
    '',
    '## Business and contact',
    `- Website: ${business.url}`,
    `- Phone / WhatsApp: ${business.phone}`,
    `- Email: ${business.email}`,
    `- Office: ${business.office}, ${business.city}, ${business.region} ${business.postalCode}, India`,
    `- Workshop: ${business.workshop}, ${business.city}, ${business.region}, India`,
    `- Service areas: ${COVERAGE_AREAS.map(area => area.name).join(', ')}`,
    '- Site visits, installation schedules, material specifications and warranty terms are confirmed for each project. Regional service pages do not represent separate offices.',
    '',
    '## Services',
    ...services.map(service => `- [${service.name}](${business.url}/services/${service.slug}): ${service.description}`),
    '',
    '## Project evidence and enquiries',
    `- [Project photographs](${business.url}/portfolio): Selected installations. Material and workshop visualisations are labelled separately on the website.`,
    `- [About AD JEET](${business.url}/about): The founder and workshop story.`,
    `- [Request a quote](${business.url}/contact): Share a site photo, size, location, quantity and target date.`,
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
