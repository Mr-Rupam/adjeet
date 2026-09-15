import { FOUNDED_YEAR } from '@/lib/coverage'

/** Business identity shared by visible contact details and search surfaces. */
export const business = {
  name: 'AD JEET',
  url: 'https://adjeet.in',
  founder: 'Ranjit Das',
  foundingYear: FOUNDED_YEAR,
  phone: '+919832011524',
  phoneDisplay: '+91 98320 11524',
  email: 'ranjitadjeet@gmail.com',
  logo: '/brand/adjeet-original.png',
  // Primary address, copied from the owner-managed Google Business Profile
  // (checked 2026-09-15). Structured data and directory listings must use this
  // exact address so every source agrees on where AD JEET is.
  workshop: 'Patiram Jote',
  street: 'Chowrangi More, Kalabagan Road, opp. B.T. Ranadev S.S.K. School, near Kalimandir, Patiram Jote',
  postalCode: '734010',
  // Second address. Other businesses in this building list
  // "Platinum Square, S.F Road, Siliguri 734005".
  office: 'Platinum Square, Station Feeder Road',
  officePostalCode: '734005',
  city: 'Siliguri',
  region: 'West Bengal',
  // Map pin and hours from the same Business Profile.
  geo: { latitude: 26.6989425, longitude: 88.4010972 },
  mapsUrl: 'https://maps.google.com/?cid=1175174050283154218',
  // The owner confirmed on 2026-09-15 that walk-in customers are welcome.
  hours: 'Monday to Saturday, 10 am to 8 pm, walk-ins welcome; closed Sunday',
} as const
