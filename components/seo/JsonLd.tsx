// =============================================================================
// Neuro IT — Structured Data (JSON-LD)
// Renders LocalBusiness + Service + FAQPage schema in <head>
// Critical for Google Local Pack, rich results, and London SEO rankings.
// =============================================================================

interface LocalBusinessSchemaProps {
  /** Override defaults for area-specific pages */
  areaName?: string
  areaUrl?:  string
  latitude?: number
  longitude?: number
  postalCode?: string
}

export function LocalBusinessSchema({ areaName, areaUrl, latitude, longitude, postalCode }: LocalBusinessSchemaProps = {}) {
  let sameAsLink = 'https://en.wikipedia.org/wiki/London'
  if (areaName) {
    const normalized = areaName.trim();
    if (normalized.toLowerCase() === 'city of london') {
      sameAsLink = 'https://en.wikipedia.org/wiki/City_of_London'
    } else if (normalized.toLowerCase() === 'westminster') {
      sameAsLink = 'https://en.wikipedia.org/wiki/City_of_Westminster'
    } else if (normalized.toLowerCase() === 'watford') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Watford'
    } else if (normalized.toLowerCase() === 'borehamwood') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Borehamwood'
    } else if (normalized.toLowerCase() === 'potters bar') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Potters_Bar'
    } else if (normalized.toLowerCase() === 'edgware') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Edgware'
    } else if (normalized.toLowerCase() === 'wembley') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Wembley'
    } else if (normalized.toLowerCase() === 'stratford') {
      sameAsLink = 'https://en.wikipedia.org/wiki/Stratford,_London'
    } else {
      sameAsLink = `https://en.wikipedia.org/wiki/London_Borough_of_${normalized.replace('&', 'and').replace(/\s+/g, '_')}`
    }
  }

  const schema = {
    '@context':   'https://schema.org',
    '@type':      'LocalBusiness',
    '@id':        `https://neuroit.co.uk${areaUrl ?? ''}#business`,
    name:         'Neuro IT',
    description:  `London's smartest home IT support. Same-day vetted technicians${areaName ? ` in ${areaName}` : ' across London'}.`,
    url:          `https://neuroit.co.uk${areaUrl ?? ''}`,
    telephone:    process.env.NEXT_PUBLIC_PHONE_NUMBER ?? '+442000000000',
    email:        'hello@neuroit.co.uk',
    logo:         'https://neuroit.co.uk/logo.png',
    image:        'https://neuroit.co.uk/og-image.jpg',
    priceRange:   '££',
    currenciesAccepted: 'GBP',
    paymentAccepted:    'Cash, Credit Card, Debit Card',
    areaServed: {
      '@type': 'City',
      name:    areaName ?? 'London',
      sameAs:  sameAsLink,
    },
    address: {
      '@type':           'PostalAddress',
      addressLocality:   areaName ?? 'London',
      addressRegion:     'England',
      addressCountry:    'GB',
      postalCode:        postalCode ?? 'N1',
    },
    geo: {
      '@type':     'GeoCoordinates',
      latitude:    latitude ?? 51.5074,
      longitude:   longitude ?? -0.1278,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '17:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'],   opens: '10:00', closes: '16:00' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    'Home IT Support Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Laptop Repair', description: 'Screen replacement, keyboard repair, liquid damage, battery replacement.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Virus & Malware Removal', description: 'Complete virus removal, security audit, and protection setup.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WiFi & Home Network Setup', description: 'Router setup, WiFi extenders, mesh networks, smart home integration.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Data Recovery', description: 'Hard drive recovery, deleted files, corrupt storage media.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Remote IT Support', description: 'Remote desktop assistance for software issues and troubleshooting.' } },
      ],
    },
    sameAs: [
      'https://www.google.com/maps?cid=PLACEHOLDER',
      'https://www.facebook.com/neurosituk',
      'https://www.instagram.com/neuro_it_london',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:    'How quickly can a technician arrive?',
        acceptedAnswer: { '@type': 'Answer', text: 'We offer same-day appointments across London, often within 2–4 hours of booking. Emergency slots are available 7 days a week.' },
      },
      {
        '@type': 'Question',
        name:    'Do you offer a no fix no fee guarantee?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. If we cannot fix your device, you pay nothing for the repair — only the call-out fee applies.' },
      },
      {
        '@type': 'Question',
        name:    'Are your technicians DBS checked?',
        acceptedAnswer: { '@type': 'Answer', text: 'All Neuro IT technicians are DBS (Disclosure and Barring Service) checked and carry ID. We take home visit safety seriously.' },
      },
      {
        '@type': 'Question',
        name:    'Do you cover Congestion Charge zones?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, we cover all London areas. Applicable Congestion Charge surcharges are shown transparently before you book.' },
      },
      {
        '@type': 'Question',
        name:    'What payment methods do you accept?',
        acceptedAnswer: { '@type': 'Answer', text: 'We accept all major credit and debit cards, Apple Pay, Google Pay, and cash. A 50% deposit is taken at booking; the remainder is paid on completion.' },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ServicePageSchema({ serviceName, description, priceMin, priceMax }: {
  serviceName:  string
  description:  string
  priceMin:     number
  priceMax:     number
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Service',
    name:       `${serviceName} — Neuro IT London`,
    description,
    provider: {
      '@type': 'LocalBusiness',
      name:    'Neuro IT',
      url:     'https://neuroit.co.uk',
    },
    areaServed:    { '@type': 'City', name: 'London' },
    offers: {
      '@type':         'Offer',
      priceCurrency:   'GBP',
      priceSpecification: {
        '@type':       'PriceSpecification',
        minPrice:      priceMin,
        maxPrice:      priceMax,
        priceCurrency: 'GBP',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
