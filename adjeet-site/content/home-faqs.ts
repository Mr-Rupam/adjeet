import { business } from '@/lib/business'

/**
 * The home page questions, also printed in llms.txt and the home FAQ JSON-LD.
 *
 * Each answer can be quoted on its own by a search or AI answer: 40 to 170
 * words, naming AD JEET and Siliguri, and stating only what `lib/business.ts`,
 * `content/services.ts` and `content/sign-comparison.ts` record. Lead times
 * stay labelled as planning estimates. No prices, reply times or site visits.
 */
export const homeFaqs = [
  {
    q: 'Who makes sign boards in Siliguri?',
    a: `${business.name} makes sign boards in ${business.city}, West Bengal. ${business.founder} founded it in ${business.foundingYear}. Glow sign boards, ACP and 3D LED letters, flex boards, vehicle branding, wall painting advertising and F-pole signs are made at its own workshop at ${business.workshop}. They are installed across North Bengal and Sikkim. Walk-ins are welcome ${business.hours.replace(', walk-ins welcome', '')}.`,
  },
  {
    q: 'What is AD JEET and what does it make?',
    a: `${business.name} is a sign board and outdoor advertising company in ${business.city}, West Bengal, founded in ${business.foundingYear} by ${business.founder}. It designs, fabricates and installs glow sign boards, ACP and 3D LED letter signage, flex prints, vehicle branding, wall advertising and F-pole signs. It also makes in-shop branding, Puja and event branding, one way vision window graphics and product displays.`,
  },
  {
    q: 'Where is AD JEET based, and which areas do you serve?',
    a: `${business.name}'s workshop is at ${business.street}, ${business.city}, West Bengal ${business.postalCode}, open ${business.hours}. Its office is at ${business.office}, ${business.city} ${business.officePostalCode}. It serves projects across North Bengal, including Darjeeling, Jalpaiguri, Cooch Behar, Alipurduar, Kalimpong, Malda, North and South Dinajpur and the Dooars, and in Sikkim, including Gangtok. Share your exact location so the installation can be planned.`,
  },
  {
    q: 'How much does a sign board cost in Siliguri?',
    a: `At ${business.name} in ${business.city}, most sign boards are quoted by area in square feet, then adjusted for the material, lighting, artwork, quantity and installation access. Send a site photo, approximate dimensions and your location. ${business.name} will discuss the scope and give a quote for your project. Delivery, installation and any design work are agreed before production.`,
  },
  {
    q: 'Which sign board is right for my shop: a glow sign, ACP or 3D LED letters?',
    a: `At ${business.name} in ${business.city}, a glow sign board lights its whole face from LEDs inside a box. An ACP board is a flat aluminium composite panel with separate 3D letters, lit from inside the letters or from behind. Glow boards are common for a single shopfront. ACP with 3D letters is often chosen by showrooms and brand outlets. A flex board without lighting suits short-term or low-budget signs. Send a photo of your frontage and ${business.name} will suggest options.`,
  },
  {
    q: 'How long does it take to make a sign board?',
    a: `As planning estimates, ${business.name} allows about 5 to 7 working days for a glow sign board and about 7 to 10 working days for an ACP board with 3D LED letters at its ${business.city} workshop. These are counted once the artwork and size are approved. A flex print can take 1 to 3 working days. Quantity, site access and the fitting date change this, so the schedule is confirmed for your job before you order.`,
  },
  {
    q: 'Can you help with design, fabrication and installation?',
    a: `Yes. Start with your logo, a reference or a photo of the space. ${business.name} works through the artwork, material and dimensions with you before anything is made at its ${business.city} workshop. The installation is then arranged for the agreed site and scope, in ${business.city} or elsewhere in North Bengal and Sikkim.`,
  },
  {
    q: 'How do I request a quote from AD JEET?',
    a: `To get a quote from ${business.name} in ${business.city}, send a photo of your shop or site on WhatsApp to ${business.phoneDisplay}. Add your town, a rough size and the date you need it. If you do not know the size, send the photo anyway. You can also call, email ${business.email} or use the contact form.`,
  },
]
