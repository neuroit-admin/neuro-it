'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [devLink, setDevLink] = useState('')

  // 1. Automatic magic link token validation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const callbackUrl = params.get('callbackUrl') || '/admin'
      if (token) {
        setIsLoading(true)
        signIn('credentials', { token, redirect: false, callbackUrl })
          .then((res) => {
            if (res?.error) {
              setErrorMsg('Invalid or expired administrator login link. Please try again.')
              setIsLoading(false)
            } else {
              window.location.href = callbackUrl
            }
          })
          .catch(err => {
            console.error('Admin magic link login failed:', err)
            setErrorMsg('Sign-in failed. Please try requesting a new link.')
            setIsLoading(false)
          })
      }
    }
  }, [])

  // 2. Submit magic link login request
  const handleAdminLogin = async () => {
    if (!email.trim()) return
    setIsLoading(true)
    setErrorMsg('')
    try {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/admin'
      
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          callbackUrl,
          isAdminLogin: true
        }),
      })
      
      const data = await res.json()
      if (res.ok && data.success) {
        setEmailSent(true)
        if (data.devLink) setDevLink(data.devLink)
      } else {
        setErrorMsg(data.error || 'Failed to send administrator login link.')
      }
    } catch (err) {
      console.error('Admin login request failed:', err)
      setErrorMsg('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          background: 'rgba(18, 18, 18, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
      >
        {/* Shield Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(0, 210, 255, 0.1)',
              border: '1px solid rgba(0, 210, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={28} style={{ color: '#00D2FF' }} />
          </div>
        </div>

        <div className="font-syne" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          NEURO<span style={{ color: '#00D2FF' }}>IT</span>
        </div>
        
        <h1
          className="font-syne"
          style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '2rem', letterSpacing: '0.05em' }}
        >
          ADMINISTRATOR PORTAL
        </h1>

        {errorMsg && (
          <div
            style={{
              padding: '0.875rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '4px',
              color: '#EF4444',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </div>
        )}

        {emailSent ? (
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(0, 210, 255, 0.05)',
              border: '1px solid rgba(0, 210, 255, 0.2)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#00D2FF', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Check Admin Inbox
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0' }}>
              We&apos;ve sent a secure magic link to <strong>{email}</strong>. Please check your email to access the dashboard.
            </p>
            {devLink && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <a href={devLink} style={{ color: '#00D2FF', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}>
                  [DEV MODE] Click here to login instantly →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Email login */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                placeholder="admin@neuroit.co.uk"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.875rem 1rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  textAlign: 'center',
                }}
                onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                aria-label="Admin Email Address"
              />
              <button
                onClick={handleAdminLogin}
                disabled={!email.trim() || isLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: email.trim() && !isLoading ? '#00D2FF' : 'var(--surface-secondary)',
                  color: email.trim() && !isLoading ? 'var(--bg-color)' : '#888888',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: email.trim() && !isLoading ? 'pointer' : 'default',
                  fontWeight: 700,
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  transition: 'background 0.2s',
                }}
              >
                {isLoading ? 'Verifying...' : 'Request Sign In Link'}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <Link
            href="/"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseOut={e => (e.currentTarget.style.color = '#888888')}
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </main>
  )
}
