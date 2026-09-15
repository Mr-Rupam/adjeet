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
  // Station Feeder Road (S.F. Road) post office area. Other businesses in the
  // same building list "Platinum Square, S.F Road, Siliguri 734005"; 734001 is
  // the Siliguri head office PIN and was wrong here.
  office: 'Platinum Square, Station Feeder Road',
  workshop: 'Patiram Jote',
  city: 'Siliguri',
  region: 'West Bengal',
  postalCode: '734005',
} as const
