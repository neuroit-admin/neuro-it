import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AreasClient from '@/components/areas/AreasClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Coverage Areas | London IT Support & Laptop Repair | Neuro IT',
  description: 'We offer certified, vetted same-day home visit IT support and laptop repair services across all London boroughs. Check your postcode for eligibility.',
  alternates: {
    canonical: 'https://neuro-it.co.uk/areas',
  },
}

export default function AreasPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-syne)' }}>
              Coverage Area
            </span>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              Where We Operate in <span style={{ color: '#00D2FF' }}>London</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Our vetted home IT engineers visit residences and home offices across all major boroughs of Greater London. Search for your area below.
            </p>
          </div>

          {/* Interactive Client Component */}
          <AreasClient />

        </div>
      </main>
      <Footer />
    </>
  )
}
