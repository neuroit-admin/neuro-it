import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_BOROUGHS = [
  // Zone 4: FREE CALL-OUT ZONE (Core area)
  { name: 'Barnet', slug: 'barnet', zone: 'FREE_CALL_OUT', lat: 51.6531, lng: -0.2001, postcodes: 'EN4,EN5,N2,N3,N20' },
  { name: 'Potters Bar', slug: 'pottersbar', zone: 'FREE_CALL_OUT', lat: 51.6985, lng: -0.1793, postcodes: 'EN6' },
  { name: 'Borehamwood', slug: 'borehamwood', zone: 'FREE_CALL_OUT', lat: 51.6578, lng: -0.2723, postcodes: 'WD6' },
  { name: 'Edgware', slug: 'edgware', zone: 'FREE_CALL_OUT', lat: 51.6135, lng: -0.2749, postcodes: 'HA8' },

  // Zone 3: £15.00 STANDARD CALL-OUT ZONE
  { name: 'Watford', slug: 'watford', zone: 'STANDARD_999', lat: 51.6565, lng: -0.3903, postcodes: 'WD17,WD18,WD19,WD24,WD25' },
  { name: 'Enfield', slug: 'enfield', zone: 'STANDARD_999', lat: 51.6522, lng: -0.0808, postcodes: 'EN1,EN2,EN3,N14,N21' },
  { name: 'Harrow', slug: 'harrow', zone: 'STANDARD_999', lat: 51.5806, lng: -0.3420, postcodes: 'HA1,HA2,HA3,HA5' },
  { name: 'Wembley', slug: 'wembley', zone: 'STANDARD_999', lat: 51.5573, lng: -0.2974, postcodes: 'HA0,HA9' },
  { name: 'Camden', slug: 'camden', zone: 'STANDARD_999', lat: 51.5290, lng: -0.1258, postcodes: 'NW1,NW3,NW5' },
  { name: 'Islington', slug: 'islington', zone: 'STANDARD_999', lat: 51.5465, lng: -0.1028, postcodes: 'N1,N5,N7' },

  // Zone 2: GREATER LONDON FLEXIBLE (Negotiated / Travel fee agreed)
  { name: 'Westminster', slug: 'westminster', zone: 'LONDON_FLEX', lat: 51.4975, lng: -0.1357, postcodes: 'SW1,W1,W2,WC2' },
  { name: 'City of London', slug: 'city-of-london', zone: 'LONDON_FLEX', lat: 51.5123, lng: -0.0906, postcodes: 'EC1,EC2,EC3,EC4' },
  { name: 'Hackney', slug: 'hackney', zone: 'LONDON_FLEX', lat: 51.5450, lng: -0.0553, postcodes: 'E1,E2,E8,E9' },
  { name: 'Stratford', slug: 'stratford', zone: 'LONDON_FLEX', lat: 51.5417, lng: -0.0036, postcodes: 'E15,E20' },
  { name: 'Ealing', slug: 'ealing', zone: 'LONDON_FLEX', lat: 51.5130, lng: -0.3080, postcodes: 'W3,W5,W13,UB1,UB2' },
  { name: 'Richmond', slug: 'richmond', zone: 'LONDON_FLEX', lat: 51.4479, lng: -0.3260, postcodes: 'TW9,TW10' },
  { name: 'Croydon', slug: 'croydon', zone: 'LONDON_FLEX', lat: 51.3762, lng: -0.0982, postcodes: 'CR0,CR2,CR7' },
  { name: 'Greenwich', slug: 'greenwich', zone: 'LONDON_FLEX', lat: 51.4891, lng: 0.0073, postcodes: 'SE3,SE10,SE18' },
  
  // Remaining Greater London Boroughs (added to Zone 2)
  { name: 'Barking & Dagenham', slug: 'barking-and-dagenham', zone: 'LONDON_FLEX', lat: 51.5607, lng: 0.1557, postcodes: 'IG11,RM8,RM9,RM10' },
  { name: 'Bexley', slug: 'bexley', zone: 'LONDON_FLEX', lat: 51.4549, lng: 0.1505, postcodes: 'DA5,DA6,DA7,DA8,DA14,DA15,DA16' },
  { name: 'Brent', slug: 'brent', zone: 'LONDON_FLEX', lat: 51.5588, lng: -0.2817, postcodes: 'NW2,NW6,NW10' },
  { name: 'Bromley', slug: 'bromley', zone: 'LONDON_FLEX', lat: 51.4039, lng: 0.0198, postcodes: 'BR1,BR2,BR3,BR4,BR5,BR6,BR7' },
  { name: 'Hammersmith & Fulham', slug: 'hammersmith-and-fulham', zone: 'LONDON_FLEX', lat: 51.4927, lng: -0.2229, postcodes: 'W6,W12,SW6' },
  { name: 'Haringey', slug: 'haringey', zone: 'LONDON_FLEX', lat: 51.5907, lng: -0.1110, postcodes: 'N8,N15,N17,N22' },
  { name: 'Havering', slug: 'havering', zone: 'LONDON_FLEX', lat: 51.5812, lng: 0.1837, postcodes: 'RM1,RM2,RM3,RM4,RM5,RM7,RM11,RM12' },
  { name: 'Hillingdon', slug: 'hillingdon', zone: 'LONDON_FLEX', lat: 51.5441, lng: -0.4760, postcodes: 'UB7,UB8,UB10,UB3,UB4,HA4' },
  { name: 'Hounslow', slug: 'hounslow', zone: 'LONDON_FLEX', lat: 51.4746, lng: -0.3680, postcodes: 'TW3,TW4,TW5,TW7,TW8,TW13' },
  { name: 'Kensington & Chelsea', slug: 'kensington-and-chelsea', zone: 'LONDON_FLEX', lat: 51.5020, lng: -0.1947, postcodes: 'W8,W11,W14,SW3,SW5,SW7,SW10' },
  { name: 'Kingston upon Thames', slug: 'kingston-upon-thames', zone: 'LONDON_FLEX', lat: 51.4085, lng: -0.3064, postcodes: 'KT1,KT2,KT3,KT5,KT6' },
  { name: 'Lambeth', slug: 'lambeth', zone: 'LONDON_FLEX', lat: 51.4607, lng: -0.1163, postcodes: 'SE11,SW2,SW4,SW8,SW9,SW12,SE24' },
  { name: 'Lewisham', slug: 'lewisham', zone: 'LONDON_FLEX', lat: 51.4452, lng: -0.0207, postcodes: 'SE4,SE6,SE8,SE13,SE14,SE23' },
  { name: 'Merton', slug: 'merton', zone: 'LONDON_FLEX', lat: 51.4014, lng: -0.1958, postcodes: 'SW19,SW20,CR4,SM4' },
  { name: 'Redbridge', slug: 'redbridge', zone: 'LONDON_FLEX', lat: 51.5886, lng: 0.0740, postcodes: 'IG1,IG2,IG3,IG4,IG5,IG6,IG8' },
  { name: 'Southwark', slug: 'southwark', zone: 'LONDON_FLEX', lat: 51.4834, lng: -0.0821, postcodes: 'SE1,SE5,SE15,SE16,SE17,SE21,SE22' },
  { name: 'Sutton', slug: 'sutton', zone: 'LONDON_FLEX', lat: 51.3618, lng: -0.1945, postcodes: 'SM1,SM2,SM3,SM5,SM6' },
  { name: 'Tower Hamlets', slug: 'tower-hamlets', zone: 'LONDON_FLEX', lat: 51.5099, lng: -0.0059, postcodes: 'E1W,E3,E14' },
  { name: 'Waltham Forest', slug: 'waltham-forest', zone: 'LONDON_FLEX', lat: 51.5908, lng: -0.0134, postcodes: 'E4,E10,E11,E17' },
  { name: 'Wandsworth', slug: 'wandsworth', zone: 'LONDON_FLEX', lat: 51.4567, lng: -0.1910, postcodes: 'SW11,SW15,SW17,SW18' }
]

export async function GET() {
  try {
    // Sync DEFAULT_BOROUGHS with database records
    const count = await prisma.coverageBorough.count()
    if (count < DEFAULT_BOROUGHS.length) {
      console.log('⚠️ Syncing new boroughs into database coverage records...')
      await prisma.$transaction(
        DEFAULT_BOROUGHS.map((b) =>
          prisma.coverageBorough.upsert({
            where: { slug: b.slug },
            update: {},
            create: b,
          })
        )
      )
    }

    let boroughs = await prisma.coverageBorough.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    // Format output to match MapNode interface expected by frontend
    const nodes = boroughs.map(b => ({
      id: b.slug,
      name: b.name,
      lat: b.lat,
      lng: b.lng,
      zone: b.zone as 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX',
      postcodes: b.postcodes.split(',').map(pc => pc.trim())
    }))

    return NextResponse.json(nodes)
  } catch (error: any) {
    console.error('Error fetching coverage areas:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
