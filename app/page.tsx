import CinematicHero from '@/components/home/CinematicHero'
import ServicesGrid from '@/components/home/ServicesGrid'
import TrustBadges from '@/components/home/TrustBadges'
import ReviewsCarousel from '@/components/home/ReviewsCarousel'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import BridgeCtas from '@/components/home/BridgeCtas'

import { prisma } from '@/lib/prisma'

export async function generateMetadata() {
  try {
    const dbPage = await prisma.cmsPage.findUnique({
      where: { slug: 'home' },
    })
    if (dbPage) {
      return {
        title: dbPage.metaTitle || 'Neuro IT — London Home IT Support & Tech Repair',
        description: dbPage.metaDescription || 'Vetted home IT support engineers in London. Fast tech repair, network setups, virus removal, device backup. Book online in 2 minutes.',
      }
    }
  } catch (error) {
    console.error('Failed to load home SEO metadata from CMS:', error)
  }
  return {
    title: 'Neuro IT — London Home IT Support & Tech Repair',
    description: 'Vetted home IT support engineers in London. Fast tech repair, network setups, virus removal, device backup. Book online in 2 minutes.',
  }
}

export default async function HomePage() {
  // Default values to fall back to if DB is empty
  let pageContent = {
    heroTitle: 'Same-Day Home IT Support & Laptop Repairs in London',
    heroSubtitle: 'No automated phone loops, no hidden call-out surcharges. Vetted, certified engineers dispatched to your door or repaired in our central workshop.',
    primaryCtaText: 'Book a Free Diagnostic',
    whatsappCtaText: 'WhatsApp Us',
  }

  try {
    const dbPage = await prisma.cmsPage.findUnique({
      where: { slug: 'home' },
    })
    if (dbPage && dbPage.sections) {
      const parsed = JSON.parse(dbPage.sections)
      pageContent = { ...pageContent, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load dynamic CMS home page content:', error)
  }

  const renderHeroTitle = (title: string) => {
    const parts = title.split(/(Laptop Repairs)/gi)
    return parts.map((part, index) => 
      part.toLowerCase() === 'laptop repairs' 
        ? <span key={index} style={{ color: '#00D2FF' }}>{part}</span> 
        : part
    )
  }

  const businessAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ'
  const businessPhone = process.env.NEXT_PUBLIC_PHONE_NUMBER || '02000000000'
  const businessWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447700000000'

  let streetAddress = '71-75 Shelton Street, Covent Garden'
  let addressLocality = 'London'
  let postalCode = 'WC2H 9JQ'

  if (businessAddress.includes('Shelton Street')) {
    streetAddress = '71-75 Shelton Street, Covent Garden'
    addressLocality = 'London'
    postalCode = 'WC2H 9JQ'
  } else {
    const parts = businessAddress.split(',').map(p => p.trim())
    if (parts.length >= 3) {
      streetAddress = parts.slice(0, parts.length - 2).join(', ')
      addressLocality = parts[parts.length - 2]
      postalCode = parts[parts.length - 1]
    }
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Neuro IT',
    'image': 'https://neuro-it.co.uk/assets/logo.png',
    '@id': 'https://neuro-it.co.uk/#localbusiness',
    'url': 'https://neuro-it.co.uk',
    'telephone': businessPhone,
    'priceRange': '££',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': streetAddress,
      'addressLocality': addressLocality,
      'postalCode': postalCode,
      'addressCountry': 'GB'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 51.5148,
      'longitude': -0.1235
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      'opens': '08:00',
      'closes': '20:00'
    },
    'sameAs': [
      `https://wa.me/${businessWhatsapp}`
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Navbar />
      <main>
        {/* Cinematic Canvas Hero — 400vh scroll */}
        <CinematicHero />

        {/* Below-hero CTA bridge */}
        <section
          style={{
            background: 'linear-gradient(to bottom, var(--bg-color), var(--surface))',
            padding: '5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2
              className="font-syne"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                lineHeight: 1.1,
              }}
            >
              {renderHeroTitle(pageContent.heroTitle)}
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1.1rem',
                marginBottom: '2.5rem',
                lineHeight: 1.7,
              }}
            >
              {pageContent.heroSubtitle}
            </p>
            <BridgeCtas
              primaryCtaText={pageContent.primaryCtaText}
              whatsappCtaText={pageContent.whatsappCtaText}
              whatsappNumber={businessWhatsapp}
            />

            {/* Google Trust Strip */}
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '99px',
                padding: '0.5rem 1.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#F59E0B', fontSize: '1.1rem' }}>★</span>
                  ))}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
                  4.9/5 Rating from 150+ Google Reviews
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <ServicesGrid />

        {/* Trust */}
        <TrustBadges />

        {/* Reviews */}
        <ReviewsCarousel />
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
