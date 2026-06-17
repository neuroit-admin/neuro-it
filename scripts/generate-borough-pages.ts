import * as fs   from 'fs'
import * as path from 'path'

const BOROUGHS = [
  { name: 'Barking and Dagenham', slug: 'barking-dagenham',  postcodes: ['RM8','RM9','RM10','IG11'] },
  { name: 'Barnet',               slug: 'barnet',            postcodes: ['EN4','EN5','N2','N3','N11','N12','N20','NW4','NW7','NW9'] },
  { name: 'Bexley',               slug: 'bexley',            postcodes: ['DA5','DA6','DA7','DA8','DA14','DA15','DA16','DA17','DA18','SE2','SE28'] },
  { name: 'Brent',                slug: 'brent',             postcodes: ['HA0','HA9','NW2','NW6','NW10'] },
  { name: 'Bromley',              slug: 'bromley',           postcodes: ['BR1','BR2','BR3','BR4','BR5','BR6','BR7','SE20','SE26'] },
  { name: 'Camden',               slug: 'camden',            postcodes: ['NW1','NW3','NW5','WC1','WC2'] },
  { name: 'City of London',       slug: 'city-of-london',    postcodes: ['EC1','EC2','EC3','EC4'] },
  { name: 'Croydon',              slug: 'croydon',           postcodes: ['CR0','CR2','CR7','SE19','SE25','SW16'] },
  { name: 'Ealing',               slug: 'ealing',            postcodes: ['UB1','UB2','UB5','UB6','W3','W5','W7','W13'] },
  { name: 'Enfield',              slug: 'enfield',           postcodes: ['EN1','EN2','EN3','N9','N13','N14','N18','N21'] },
  { name: 'Greenwich',            slug: 'greenwich',         postcodes: ['SE2','SE3','SE7','SE9','SE10','SE18','SE28'] },
  { name: 'Hackney',              slug: 'hackney',           postcodes: ['E2','E5','E8','E9','N1','N4','N16'] },
  { name: 'Hammersmith and Fulham', slug: 'hammersmith-fulham', postcodes: ['SW6','W6','W12','W14'] },
  { name: 'Haringey',             slug: 'haringey',          postcodes: ['N4','N8','N10','N15','N17','N22'] },
  { name: 'Harrow',               slug: 'harrow',            postcodes: ['HA1','HA2','HA3','HA5','HA7'] },
  { name: 'Havering',             slug: 'havering',          postcodes: ['RM1','RM2','RM3','RM5','RM11','RM12','RM13','RM14'] },
  { name: 'Hillingdon',           slug: 'hillingdon',        postcodes: ['UB3','UB4','UB7','UB8','UB10','UB18'] },
  { name: 'Hounslow',             slug: 'hounslow',          postcodes: ['TW3','TW4','TW5','TW6','TW7','TW8','TW13','TW14'] },
  { name: 'Islington',            slug: 'islington',         postcodes: ['EC1','N1','N5','N7','N19'] },
  { name: 'Kensington and Chelsea', slug: 'kensington-chelsea', postcodes: ['SW3','SW5','SW7','SW10','W8','W11','W14'] },
  { name: 'Kingston upon Thames', slug: 'kingston',          postcodes: ['KT1','KT2','KT3','KT5','KT6','KT9'] },
  { name: 'Lambeth',              slug: 'lambeth',           postcodes: ['SE1','SE5','SE11','SE24','SE27','SW2','SW4','SW8','SW9'] },
  { name: 'Lewisham',             slug: 'lewisham',          postcodes: ['SE4','SE6','SE8','SE12','SE13','SE14','SE23'] },
  { name: 'Merton',               slug: 'merton',            postcodes: ['SM4','SW19','SW20','CR4'] },
  { name: 'Newham',               slug: 'newham',            postcodes: ['E6','E7','E12','E13','E15','E16','E20'] },
  { name: 'Redbridge',            slug: 'redbridge',         postcodes: ['IG1','IG2','IG3','IG4','IG5','IG6','IG7','IG8','E11','E18'] },
  { name: 'Richmond upon Thames', slug: 'richmond',          postcodes: ['TW1','TW2','TW9','TW10','TW11','TW12','SW13','SW14'] },
  { name: 'Southwark',            slug: 'southwark',         postcodes: ['SE1','SE5','SE15','SE16','SE17','SE21','SE22'] },
  { name: 'Sutton',               slug: 'sutton',            postcodes: ['SM1','SM2','SM3','SM5','SM6','SM7','CR5'] },
  { name: 'Tower Hamlets',        slug: 'tower-hamlets',     postcodes: ['E1','E3','E14'] },
  { name: 'Waltham Forest',       slug: 'waltham-forest',    postcodes: ['E4','E10','E11','E17','E18'] },
  { name: 'Wandsworth',           slug: 'wandsworth',        postcodes: ['SW11','SW12','SW15','SW17','SW18','SW19','SW20'] },
  { name: 'Westminster',          slug: 'westminster',       postcodes: ['W1','W2','W9','NW1','NW8','SW1','WC2'] },
]

const TEMPLATE = (b: { name: string; slug: string; postcodes: string[] }) => `import LocalSeoPage from '@/components/seo/LocalSeoPage'
import type { Metadata } from 'next'
import { LocalBusinessSchema } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'IT Support ${b.name} | Same-Day Home Visits | Neuro IT',
  description: 'Expert IT support in ${b.name}. Same-day home visits, DBS-checked technicians. Laptop repair, virus removal, WiFi setup. No fix no fee guarantee.',
  alternates: { canonical: 'https://neuro-it.co.uk/it-support-${b.slug}' },
}

export default function BoroughPage() {
  return (
    <>
      <LocalBusinessSchema areaName="${b.name}" areaUrl="/it-support-${b.slug}" />
      <LocalSeoPage
        area="${b.name}"
        areaSlug="${b.slug}"
        description="Expert home IT support across ${b.name}. DBS-checked technicians, same-day laptop repair, virus removal, WiFi setup — right at your door."
        postcodes={${JSON.stringify(b.postcodes)}}
      />
    </>
  )
}
`

let created = 0
for (const b of BOROUGHS) {
  const dir  = path.join(process.cwd(), 'app', `it-support-${b.slug}`)
  const file = path.join(dir, 'page.tsx')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(file)) { fs.writeFileSync(file, TEMPLATE(b)); created++ }
  console.log(`✓ /it-support-${b.slug}`)
}
console.log(`\nDone. ${created} pages created.`)
