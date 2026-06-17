// =============================================================================
// Neuro IT — Dedicated Guest Tracking Page
// =============================================================================
'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import TrackForm from '@/components/layout/TrackForm'

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '120px', paddingBottom: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '450px', width: '100%', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
              Real-time Updates
            </span>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.75rem' }}>
              Track Your <span style={{ color: '#00D2FF' }}>Repair</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Enter your ticket reference code and the email address used during booking to view live progress.
            </p>
          </div>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <TrackForm variant="stacked" />
          </div>

        </div>
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
