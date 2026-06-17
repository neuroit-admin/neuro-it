import LocalSeoPage from '@/components/seo/LocalSeoPage'
import { LocalBusinessSchema } from '@/components/seo/JsonLd'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const BOROUGH_MAP = {
  'barking-dagenham': {
    name: 'Barking & Dagenham',
    postcodes: ['IG11', 'RM8', 'RM9', 'RM10'],
    desc: 'Expert home IT support across Barking and Dagenham. Certified technicians, same-day laptop repair, virus removal, WiFi setup.'
  },
  'barnet': {
    name: 'Barnet',
    postcodes: ['EN4', 'EN5', 'HA8', 'N2', 'N3', 'N11', 'N12', 'N20', 'NW4', 'NW7', 'NW9', 'NW11'],
    desc: 'Vetted same-day IT support across Barnet. Home visits, laptop repair, WiFi diagnostics.'
  },
  'bexley': {
    name: 'Bexley',
    postcodes: ['DA1', 'DA5', 'DA6', 'DA7', 'DA8', 'DA14', 'DA15', 'DA16', 'DA17', 'DA18'],
    desc: 'Professional computer diagnostics and repair services in Bexley and nearby areas.'
  },
  'brent': {
    name: 'Brent',
    postcodes: ['HA0', 'HA9', 'NW2', 'NW6', 'NW10'],
    desc: 'Same-day home visit IT technicians in Brent. Setup routers, fix laptop screens.'
  },
  'bromley': {
    name: 'Bromley',
    postcodes: ['BR1', 'BR2', 'BR3', 'BR4', 'BR5', 'BR6', 'BR7', 'SE19', 'SE20', 'SE26'],
    desc: 'On-site home and office computer repair service in Bromley borough.'
  },
  'camden': {
    name: 'Camden',
    postcodes: ['EC1', 'N1', 'N6', 'N19', 'NW1', 'NW3', 'NW5', 'NW6', 'NW8', 'W1', 'W2', 'WC1', 'WC2'],
    desc: 'Top-rated Camden home computer repairs. Direct technician visits, WiFi mesh setup.'
  },
  'city-of-london': {
    name: 'City of London',
    postcodes: ['EC1', 'EC2', 'EC3', 'EC4'],
    desc: 'Express IT support for residents and small offices in the City of London.'
  },
  'croydon': {
    name: 'Croydon',
    postcodes: ['CR0', 'CR2', 'CR4', 'CR7', 'CR8', 'SE19', 'SE25'],
    desc: 'Quick computer fixing, virus scanning, and WiFi range boosters in Croydon.'
  },
  'ealing': {
    name: 'Ealing',
    postcodes: ['W3', 'W5', 'W7', 'W13', 'UB1', 'UB2', 'UB5', 'UB6'],
    desc: 'Expert same-day laptop, PC and Mac diagnostics right in Ealing.'
  },
  'enfield': {
    name: 'Enfield',
    postcodes: ['EN1', 'EN2', 'EN3', 'EN4', 'N14', 'N18', 'N21'],
    desc: 'Home visits and professional tech support in Enfield. No fix no fee repair.'
  },
  'greenwich': {
    name: 'Greenwich',
    postcodes: ['SE3', 'SE7', 'SE8', 'SE9', 'SE10', 'SE18', 'SE28'],
    desc: 'Local IT services in Greenwich. Speed up computers, configure printers, fix WiFi.'
  },
  'hackney': {
    name: 'Hackney',
    postcodes: ['E1', 'E2', 'E5', 'E8', 'E9', 'N1', 'N4', 'N16'],
    desc: 'Expert home IT support across Hackney. Certified technicians, same-day repair.'
  },
  'hammersmith-fulham': {
    name: 'Hammersmith & Fulham',
    postcodes: ['W6', 'W12', 'W14', 'SW6'],
    desc: 'Professional on-site laptop repair, malware removal and network setup in Hammersmith.'
  },
  'haringey': {
    name: 'Haringey',
    postcodes: ['N4', 'N6', 'N8', 'N10', 'N15', 'N17', 'N22'],
    desc: 'Fast, secure home computer support in Haringey. Same-day diagnostic visits.'
  },
  'harrow': {
    name: 'Harrow',
    postcodes: ['HA1', 'HA2', 'HA3', 'HA5', 'HA7', 'HA8'],
    desc: 'Reliable laptop, PC, and smart home support in Harrow.'
  },
  'havering': {
    name: 'Havering',
    postcodes: ['RM1', 'RM2', 'RM3', 'RM5', 'RM7', 'RM11', 'RM12'],
    desc: 'Quality home PC technician support across Havering and Romford.'
  },
  'hillingdon': {
    name: 'Hillingdon',
    postcodes: ['UB7', 'UB8', 'UB10', 'HA4', 'HA6'],
    desc: 'Expert IT diagnostics and device repairs at your door in Hillingdon.'
  },
  'hounslow': {
    name: 'Hounslow',
    postcodes: ['TW3', 'TW4', 'TW5', 'TW7', 'TW8', 'W4'],
    desc: 'Local tech support engineers serving Hounslow and Brentford.'
  },
  'islington': {
    name: 'Islington',
    postcodes: ['EC1', 'N1', 'N5', 'N7', 'N19'],
    desc: 'Same-day home visit computer repairs in Islington. Vetted tech support.'
  },
  'kensington-chelsea': {
    name: 'Kensington & Chelsea',
    postcodes: ['SW3', 'SW5', 'SW7', 'SW10', 'W8', 'W11', 'W14'],
    desc: 'Premium home technology diagnostics and repair in Kensington and Chelsea.'
  },
  'kingston': {
    name: 'Kingston upon Thames',
    postcodes: ['KT1', 'KT2', 'KT3', 'KT5', 'KT6'],
    desc: 'Local home support engineers serving Kingston and Surbiton.'
  },
  'lambeth': {
    name: 'Lambeth',
    postcodes: ['SE1', 'SE11', 'SE24', 'SW2', 'SW4', 'SW8', 'SW9', 'SW12', 'SW16'],
    desc: 'On-site laptop fixing, wifi diagnostics, and smart home set-up in Lambeth.'
  },
  'lewisham': {
    name: 'Lewisham',
    postcodes: ['SE4', 'SE6', 'SE8', 'SE12', 'SE13', 'SE14', 'SE23', 'BR1', 'BR3'],
    desc: 'Fast home visits and laptop repairs across Lewisham.'
  },
  'merton': {
    name: 'Merton',
    postcodes: ['SW19', 'SW20', 'SM4', 'CR4'],
    desc: 'Certified home tech support and laptop fixes in Wimbledon and Merton.'
  },
  'newham': {
    name: 'Newham',
    postcodes: ['E6', 'E7', 'E12', 'E13', 'E15', 'E16', 'E20'],
    desc: 'Home visits and computer repairs in Stratford and Newham.'
  },
  'north-london': {
    name: 'North London',
    postcodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20', 'N21', 'N22'],
    desc: 'Same-day home visit IT technicians across North London.'
  },
  'redbridge': {
    name: 'Redbridge',
    postcodes: ['IG1', 'IG2', 'IG3', 'IG4', 'IG5', 'IG6', 'IG8', 'RM6'],
    desc: 'Local tech support and computer repair in Ilford and Redbridge.'
  },
  'richmond': {
    name: 'Richmond upon Thames',
    postcodes: ['TW9', 'TW10', 'TW11', 'TW12', 'SW13', 'SW14'],
    desc: 'Richmond and Twickenham home tech support. Vetted engineers, same-day diagnostics.'
  },
  'southwark': {
    name: 'Southwark',
    postcodes: ['SE1', 'SE5', 'SE15', 'SE16', 'SE17', 'SE21', 'SE22', 'SE24'],
    desc: 'Professional home computer fixing and networking in Southwark.'
  },
  'sutton': {
    name: 'Sutton',
    postcodes: ['SM1', 'SM2', 'SM3', 'SM5', 'SM6', 'CR4'],
    desc: 'Fast home IT assistance and PC fixes in Sutton and Carshalton.'
  },
  'tower-hamlets': {
    name: 'Tower Hamlets',
    postcodes: ['E1', 'E2', 'E3', 'E14'],
    desc: 'Local computer repairs and network setup in Tower Hamlets.'
  },
  'waltham-forest': {
    name: 'Waltham Forest',
    postcodes: ['E4', 'E10', 'E11', 'E17'],
    desc: 'Fast home visits and laptop repairs in Walthamstow and Waltham Forest.'
  },
  'wandsworth': {
    name: 'Wandsworth',
    postcodes: ['SW11', 'SW12', 'SW15', 'SW17', 'SW18', 'SW19'],
    desc: 'Same-day home visits and PC repairs in Wandsworth and Battersea.'
  },
  'westminster': {
    name: 'Westminster',
    postcodes: ['SW1', 'W1', 'W2', 'W9', 'WC2', 'NW1', 'NW8'],
    desc: 'Express home support and device repairs in Westminster and Belgravia.'
  }
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string }> }): Promise<Metadata> {
  const { borough } = await params

  let dbData = null
  try {
    const boroughRecord = await prisma.coverageBorough.findUnique({
      where: { slug: borough }
    })
    if (boroughRecord) {
      dbData = {
        name: boroughRecord.name,
        desc: `Expert IT support in ${boroughRecord.name}. Same-day home visits, vetted technicians. Laptop repair, virus removal, WiFi setup. No fix no fee guarantee.`
      }
    }
  } catch (error) {
    console.error('Error fetching borough metadata:', error)
  }

  const data = dbData || (BOROUGH_MAP as any)[borough]
  if (!data) return {}

  return {
    title: `IT Support ${data.name} | Same-Day Home Visits | Neuro IT`,
    description: data.desc || `Expert IT support in ${data.name}. Same-day home visits, vetted technicians. Laptop repair, virus removal, WiFi setup. No fix no fee guarantee.`,
    alternates: { canonical: `https://neuro-it.co.uk/areas/${borough}` },
  }
}

export default async function BoroughPage({ params }: { params: Promise<{ borough: string }> }) {
  const { borough } = await params

  let dbData = null
  try {
    const boroughRecord = await prisma.coverageBorough.findUnique({
      where: { slug: borough }
    })
    if (boroughRecord) {
      dbData = {
        name: boroughRecord.name,
        postcodes: boroughRecord.postcodes.split(',').map(p => p.trim()),
        desc: `Expert home IT support across ${boroughRecord.name}. Certified technicians, same-day laptop repair, virus removal, WiFi setup.`
      }
    }
  } catch (error) {
    console.error('Error loading borough page data:', error)
  }

  const data = dbData || (BOROUGH_MAP as any)[borough]

  if (!data) {
    notFound()
  }

  // Fetch 6 popular/active services for smart internal linking
  let services = await prisma.service.findMany({
    where: {
      isActive: true,
      slug: {
        in: [
          'screen-replacement',
          'virus-removal',
          'wifi-setup-configuration',
          'hard-drive-recovery',
          'new-laptop-setup',
          'emergency-same-day-home-visit'
        ]
      }
    },
    select: {
      name: true,
      slug: true
    }
  })

  if (services.length < 6) {
    const extra = await prisma.service.findMany({
      where: {
        isActive: true,
        NOT: {
          slug: { in: services.map(s => s.slug) }
        }
      },
      take: 6 - services.length,
      select: {
        name: true,
        slug: true
      }
    })
    services = [...services, ...extra]
  }

  // Retrieve details for local business schema
  let lat: number | undefined = undefined
  let lng: number | undefined = undefined
  let pcode: string | undefined = undefined

  try {
    const boroughRecord = await prisma.coverageBorough.findUnique({
      where: { slug: borough }
    })
    if (boroughRecord) {
      lat = boroughRecord.lat
      lng = boroughRecord.lng
      pcode = boroughRecord.postcodes.split(',')[0]?.trim()
    }
  } catch (error) {
    console.error('Failed to get schema details for borough:', error)
  }

  return (
    <>
      <LocalBusinessSchema 
        areaName={data.name} 
        areaUrl={`/areas/${borough}`} 
        latitude={lat}
        longitude={lng}
        postalCode={pcode}
      />
      <LocalSeoPage
        area={data.name}
        areaSlug={borough}
        description={data.desc}
        postcodes={data.postcodes}
        services={services}
      />
    </>
  )
}

export async function generateStaticParams() {
  try {
    const activeBoroughs = await prisma.coverageBorough.findMany({
      where: { isActive: true },
      select: { slug: true }
    })
    
    if (activeBoroughs.length > 0) {
      return activeBoroughs.map((b) => ({
        borough: b.slug,
      }))
    }
  } catch (error) {
    console.error('Failed to generate static params for coverage boroughs:', error)
  }

  return Object.keys(BOROUGH_MAP).map((borough) => ({
    borough,
  }))
}
