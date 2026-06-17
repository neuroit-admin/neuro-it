'use client'

import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Unhandled app error:', error)
  }, [error])

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
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
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
            <AlertCircle size={14} /> SYSTEM FAULT DETECTED
          </div>

          {/* Large Error Heading */}
          <h1 className="font-syne" style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: '0 0 1.5rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            An Unexpected Error Occurred
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: '0 0 2.5rem'
          }}>
            We apologize for the inconvenience. An unexpected system exception has occurred. Our technical team has been notified. You can try to reset the application state or return to the home page.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <button
              onClick={() => reset()}
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
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(0, 210, 255, 0.2)'
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.background = '#00B8DF'
                btn.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.background = '#00D2FF'
                btn.style.transform = 'none'
              }}
            >
              <RefreshCw size={16} /> Try Again
            </button>

            <Link
              href="/"
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
              <Home size={16} /> Return Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
