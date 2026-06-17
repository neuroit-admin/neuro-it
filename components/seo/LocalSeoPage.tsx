'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import Link from 'next/link'
import type { Metadata } from 'next'

interface LocalPageProps {
  area: string
  areaSlug: string
  description: string
  postcodes: string[]
  services: { name: string; slug: string }[]
}

function LocalSeoPage({ area, areaSlug, description, postcodes, services }: LocalPageProps) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '72px', paddingBottom: '100px' }}>
        {/* Hero */}
        <section style={{ padding: '5rem 1.5rem 3rem', background: 'linear-gradient(to bottom, #121212, #0A0A0A)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(1.75rem, 5vw, 3rem)', marginBottom: '1.25rem' }}>
              Local IT Support & Computer Repairs in {area}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {description}
            </p>
            <Link
              href="/book"
              style={{
                display: 'inline-block', padding: '1rem 2.5rem', background: '#00D2FF', color: 'var(--bg-color)',
                textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', borderRadius: '2px', fontSize: '0.95rem',
              }}
            >
              Book a Technician in {area}
            </Link>
          </div>
        </section>

        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          {/* What we offer */}
          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            What We Offer in {area}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {services.map(svc => (
              <Link key={svc.slug} href={`/services/${svc.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#00D2FF'
                    e.currentTarget.style.background = 'rgba(0,210,255,0.02)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--surface)'
                  }}
                >
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, margin: 0, transition: 'color 0.2s' }}>
                    {svc.name} in {area}
                  </p>
                  <span style={{ color: '#00D2FF', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginTop: '0.5rem' }}>
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Why Neuro IT */}
          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Why Choose Neuro IT?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {[
              { title: 'Same-Day Service', desc: `We offer same-day home visits across ${area}. Book before 12pm for an afternoon appointment.` },
              { title: 'Security Vetted Technicians', desc: 'Every technician is security-vetted and insured for your peace of mind.' },
              { title: 'No Fix, No Fee', desc: "If we can't resolve your issue, you don't pay. It's that simple." },
              { title: 'Transparent Pricing', desc: 'You see the price range before you confirm. No hidden fees.' },
            ].map(item => (
              <div key={item.title} style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <h3 className="font-syne" style={{ color: '#00D2FF', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Postcodes */}
          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
            Areas We Cover in {area}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            We cover the following postcode areas: {postcodes.join(', ')}
          </p>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>
              Need IT help in {area}?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Book online in under 2 minutes.</p>
            <Link
              href="/book"
              style={{
                display: 'inline-block', padding: '0.875rem 2rem', background: '#00D2FF', color: 'var(--bg-color)',
                textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', borderRadius: '2px',
              }}
            >
              Book Now →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}

export default LocalSeoPage
