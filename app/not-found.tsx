'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Home, Wrench, AlertTriangle, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'var(--bg-color)',
        paddingTop: '120px',
        paddingBottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background effects */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '30%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: '600px',
          width: '100%',
          padding: '0 1.5rem',
          textAlign: 'center',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Neon Error Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '99px',
            color: '#EF4444',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-jetbrains)',
            letterSpacing: '0.08em',
            marginBottom: '2rem'
          }}>
            <AlertTriangle size={14} /> ERROR CODE: 404
          </div>

          {/* Large 404 Text */}
          <h1 className="font-syne" style={{
            fontSize: 'clamp(5rem, 15vw, 8rem)',
            fontWeight: 900,
            lineHeight: 1,
            margin: '0 0 1.5rem',
            letterSpacing: '-0.05em',
            background: 'linear-gradient(180deg, #FFFFFF 30%, rgba(255,255,255,0.15) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255,255,255,0.1)'
          }}>
            404
          </h1>

          <h2 className="font-syne" style={{
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            Page Off the Grid (404)
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 0 2.5rem'
          }}>
            It looks like this destination has been decommissioned, moved, or doesn&apos;t exist. Let&apos;s get your connection back online and return home.
          </p>

          {/* Navigation Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                background: '#00D2FF',
                color: 'var(--bg-color)',
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-syne)',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(0, 210, 255, 0.2)'
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLAnchorElement
                btn.style.background = '#00B8DF'
                btn.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLAnchorElement
                btn.style.background = '#00D2FF'
                btn.style.transform = 'none'
              }}
            >
              <Home size={16} /> Return Home
            </Link>

            <Link
              href="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-syne)',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLAnchorElement
                btn.style.background = 'var(--surface-secondary)'
                btn.style.borderColor = 'rgba(255,255,255,0.15)'
                btn.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLAnchorElement
                btn.style.background = 'rgba(255,255,255,0.03)'
                btn.style.borderColor = 'var(--border)'
                btn.style.transform = 'none'
              }}
            >
              <Wrench size={16} /> View Services
            </Link>
          </div>

          {/* Quick link to Booking */}
          <Link
            href="/book"
            style={{
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#00D2FF',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#8B5CF6' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#00D2FF' }}
          >
            Book a Repair Visit <ArrowRight size={14} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
