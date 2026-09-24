import { business } from '@/lib/business'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { services } from '@/content/services'
import { homeFaqs } from '@/content/home-faqs'
import { programmaticPages, CITY_LABELS } from '@/content/programmatic'
import { SITE_REVIEWED, formatReviewDate } from '@/content/page-reviews'
import { COMPARED_BOARDS, COMPARISON_COLUMNS, COMPARISON_HEADING, COMPARISON_NOTE } from '@/content/sign-comparison'

export const dynamic = 'force-static'

// Optional reading aid. Search visibility does not depend on this file.
// Derive contact facts and links from the same records as the website, and
// reuse the visible definitions and FAQ answers so assistants quote the page.
export function GET() {
  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.name} is a sign board, printing and outdoor advertising company in ${business.city}, West Bengal, India. Founded in ${business.foundingYear} by ${business.founder}. It designs, fabricates and installs signage from its own Siliguri workshop for businesses across North Bengal and Sikkim.`,
    '',
    `Last reviewed: ${formatReviewDate(SITE_REVIEWED)}.`,
    '',
    '## Business and contact',
    `- Name: ${business.name} (also written ADJEET or AD-JEET)`,
    `- Not to be confused with similarly named advertising businesses elsewhere in West Bengal: ${business.name}'s workshop and office are both in ${business.city}, and it was founded in ${business.foundingYear} by ${business.founder}.`,
    `- Website: ${business.url}`,
    `- Phone / WhatsApp: ${business.phone}`,
    `- Email: ${business.email}`,
    `- Workshop (main address): ${business.street}, ${business.city}, ${business.region} ${business.postalCode}, India`,
    `- Office: ${business.office}, ${business.city}, ${business.region} ${business.officePostalCode}, India`,
    `- Hours: ${business.hours}`,
    `- Google Maps: ${business.mapsUrl}`,
    `- Founded: ${business.foundingYear}, by ${business.founder}`,
    `- Service areas: ${COVERAGE_AREAS.map(area => area.name).join(', ')}`,
    '- Site visits, installation schedules, prices, material specifications and warranty terms are confirmed for each project. Regional service pages do not represent separate offices.',
    '',
    '## Services',
    ...services.map(service => `- [${service.name}](${business.url}/services/${service.slug}): ${service.answer} Also called: ${service.alternateNames.join(', ')}. Planning lead time: ${service.turnaround}.`),
    '',
    `## ${COMPARISON_HEADING}`,
    ...COMPARED_BOARDS.map(board => `- [${board.name}](${business.url}/services/${board.slug}): ${board.cells.map((cell, index) => `${COMPARISON_COLUMNS[index]}: ${cell}`).join('. ')}.`),
    `- ${COMPARISON_NOTE}`,
    '',
    '## Regional service guides',
    ...programmaticPages.map(page => `- [${page.searchPhrase} in ${CITY_LABELS[page.city]}](${business.url}/${page.slug})`),
    '',
    '## Common questions',
    ...homeFaqs.flatMap(faq => [`### ${faq.q}`, faq.a, '']),
    '## Project evidence and enquiries',
    `- [Project photographs](${business.url}/portfolio): Selected installations. Material and workshop visualisations are labelled separately on the website.`,
    `- [About ${business.name}](${business.url}/about): The founder and workshop story.`,
    `- [Request a quote](${business.url}/contact): Share a site photo, size, location, quantity and target date.`,
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
