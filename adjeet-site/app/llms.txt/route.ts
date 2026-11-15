import { business } from '@/lib/business'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { services } from '@/content/services'
import { homeFaqs } from '@/content/home-faqs'
import { TOWNS, townPath } from '@/content/areas'
import { formatReviewDate, newestReview } from '@/content/page-reviews'
import { BRAND_TRADES, FOR_BRANDS_FAQS, FOR_BRANDS_PATH } from '@/content/for-brands'
import { LANGUAGES_LINE } from '@/content/enquiry'
import { COMPARED_BOARDS, COMPARISON_COLUMNS, COMPARISON_HEADING, COMPARISON_NOTE } from '@/content/sign-comparison'
import { ALSO_SERVICES, COMPANIES_SERVED, CREW_NETWORK, GPS_PHOTO_LINE, JOB_DAYS_CAPTION, VEHICLES, WORKSHOP, brandTenureLines, jobDaysLabel } from '@/content/company-figures'
import type { ServiceSlug } from '@/content/services'

export const dynamic = 'force-static'

// Optional reading aid. Search visibility does not depend on this file.
// Derive contact facts and links from the same records as the website, and
// reuse the visible definitions and FAQ answers so assistants quote the page.
export function GET() {
  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.name} is an advertising agency in ${business.city}, West Bengal, India, founded in ${business.foundingYear} by ${business.founder}. It does outdoor advertising, signage and brand rollouts across North Bengal and Sikkim, made at its own workshop and put up by its own crews, for brands' regional and trade marketing teams and for local businesses.`,
    '',
    // The newest review date on the site, so this file never trails the pages.
    `Last reviewed: ${formatReviewDate(newestReview())}.`,
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
    `- Languages: ${LANGUAGES_LINE}`,
    `- Google Maps: ${business.mapsUrl}`,
    `- Founded: ${business.foundingYear}, by ${business.founder}`,
    `- Service areas: ${COVERAGE_AREAS.map(area => area.name).join(', ')}`,
    `- Track record: ${COMPANIES_SERVED}. ${brandTenureLines().join('; ')}.`,
    `- Workshop: ${WORKSHOP.area}, at ${WORKSHOP.place}. Fitting: ${CREW_NETWORK.line}, with ${VEHICLES.line}.`,
    `- ${GPS_PHOTO_LINE}`,
    '- Site visits, installation schedules, prices, material specifications and warranty terms are confirmed for each project. Town pages do not represent separate offices.',
    '',
    '## Services',
    ...services.map(service => `- [${service.name}](${business.url}/services/${service.slug}): ${service.answer} Also called: ${service.alternateNames.join(', ')}. ${jobDaysLabel(service.slug as ServiceSlug) ? `Job time: ${service.turnaround}. ${JOB_DAYS_CAPTION}` : `Planning lead time: ${service.turnaround}.`}`),
    `- Also offered by AD JEET: ${ALSO_SERVICES.join(', ')}. Ask with the town and the dates.`,
    '',
    `## ${COMPARISON_HEADING}`,
    ...COMPARED_BOARDS.map(board => `- [${board.name}](${business.url}/services/${board.slug}): ${board.cells.map((cell, index) => `${COMPARISON_COLUMNS[index]}: ${cell}`).join('. ')}.`),
    `- ${COMPARISON_NOTE}`,
    '',
    '## Areas we cover',
    `- [Areas we cover](${business.url}/areas): Every coverage place with its distance from the Siliguri workshop and how a job there is planned. Everything is made in Siliguri and installed on site.`,
    ...TOWNS.filter(town => town.indexable).map(town => `- [${town.name}](${business.url}${townPath(town)}): ${town.metaDescription}`),
    '',
    '## For brands',
    `- [Dealer boards and rollouts for brands](${business.url}${FOR_BRANDS_PATH}): For regional, zonal and trade marketing teams. ${BRAND_TRADES.map(trade => trade.title).join(', ')}, made at the ${business.city} workshop and fitted across North Bengal and Sikkim. Send one outlet list, with a frontage photo and a size for each outlet and artwork files named per outlet.`,
    ...FOR_BRANDS_FAQS.flatMap(faq => [`### ${faq.q}`, faq.a, '']),
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
