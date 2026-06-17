'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, User } from 'lucide-react'
import Link from 'next/link'
import type { BookingData } from '@/app/book/page'
import { useSession } from 'next-auth/react'

interface Props {
  bookingData: BookingData
}

export default function BookingSuccess({ bookingData }: Props) {
  const { data: session, status } = useSession()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [devLink, setDevLink] = useState('')

  const referenceCode = bookingData.referenceCode || 
    `NEURO-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  useEffect(() => {
    // Clear session token from sessionStorage
    sessionStorage.removeItem('neuro-session')
  }, [])

  const handleCreateAccount = async () => {
    if (!bookingData.email) return
    setIsCreatingAccount(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bookingData.email, callbackUrl: '/portal', expiresInHours: 72 }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAccountCreated(true)
        if (data.devLink) setDevLink(data.devLink)
      } else {
        setErrorMsg(data.error || 'Failed to request account creation link.')
      }
    } catch (err) {
      console.error('Account creation request failed:', err)
      setErrorMsg('An error occurred. Please try again.')
    } finally {
      setIsCreatingAccount(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        width: '100%',
        margin: '3rem auto',
        padding: '1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '2px solid #22C55E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
        }}
      >
        <CheckCircle size={40} style={{ color: '#22C55E' }} />
      </div>

      <h1
        className="font-syne"
        style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', marginBottom: '1rem' }}
      >
        Booking Confirmed!
      </h1>

      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        We&apos;ve received your request. Our team will confirm your appointment and assign a technician shortly.
      </p>

      {/* Reference code */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em' }}>
          YOUR REFERENCE
        </p>
        <p
          className="font-mono"
          style={{ color: '#00D2FF', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}
        >
          {referenceCode}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Save this code — you&apos;ll need it to track your repair
        </p>
      </div>

      {bookingData.securityToken && bookingData.ticketId && (
        <div
          style={{
            background: 'rgba(0, 210, 255, 0.05)',
            border: '1px solid rgba(0, 210, 255, 0.2)',
            borderRadius: '4px',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            You can track your repair progress live at any time using this secure link:
          </p>
          <Link
            href={`/portal/ticket/${bookingData.ticketId}?token=${bookingData.securityToken}`}
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.5rem',
              background: '#00D2FF',
              color: 'var(--bg-color)',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '4px',
              textDecoration: 'none',
            }}
          >
            Track Repair Progress Live →
          </Link>
        </div>
      )}

      {/* GDPR Opt-in Account Creation Card */}
      {status !== 'authenticated' && bookingData.email && (
        <div
          style={{
            background: 'var(--surface)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '2rem 1.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          {accountCreated ? (
            <div>
              <p style={{ color: '#00D2FF', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Account Request Sent!
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: devLink ? '1rem' : '0' }}>
                We&apos;ve sent a secure magic link to <strong>{bookingData.email}</strong>. Check your inbox to sign in and track your repair.
              </p>
              {process.env.NODE_ENV === 'development' && devLink && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <p style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    [DEVELOPMENT MODE BYPASS]
                  </p>
                  <a
                    href={devLink}
                    style={{
                      display: 'inline-block',
                      padding: '0.65rem 1.25rem',
                      background: '#00D2FF',
                      color: 'var(--bg-color)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Log In Instantly (Bypass) →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                Track Your Repair Live
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Would you like to create a free account to view updates, technician tracking, and manage your bookings in real-time?
              </p>
              
              {errorMsg && (
                <p style={{ color: '#EF4444', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: '4px' }}>
                  {errorMsg}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    padding: '0.75rem 1.5rem',
                    background: '#00D2FF',
                    color: 'var(--bg-color)',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-syne)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {isCreatingAccount ? 'Creating...' : 'Yes, Create Free Account →'}
                </button>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Or just receive standard updates at <strong>{bookingData.email}</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {status === 'authenticated' && (
          <Link
            href="/portal"
            id="success-portal-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              fontFamily: 'var(--font-syne)',
            }}
          >
            <User size={18} /> View My Portal
          </Link>
        )}
        <Link
          href="/"
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
