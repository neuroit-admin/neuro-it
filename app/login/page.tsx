'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [devLink, setDevLink] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const callbackUrl = params.get('callbackUrl') || '/portal'
      if (token) {
        setIsLoading(true)
        signIn('credentials', { token, redirect: false, callbackUrl })
          .then((res) => {
            if (res?.error) {
              setErrorMsg('Invalid or expired login link. Please try again.')
              setIsLoading(false)
            } else {
              window.location.href = callbackUrl
            }
          })
          .catch(err => {
            console.error('Magic link login failed:', err)
            setErrorMsg('Sign-in failed. Please try requesting a new link.')
            setIsLoading(false)
          })
      }
    }
  }, [])

  const handleEmailLogin = async () => {
    if (!email.trim()) return
    setIsLoading(true)
    setErrorMsg('')
    try {
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl') || '/portal'
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), callbackUrl }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEmailSent(true)
        if (data.devLink) setDevLink(data.devLink)
      } else {
        setErrorMsg(data.error || 'Failed to send login link.')
      }
    } catch (err) {
      console.error('Magic link request failed:', err)
      setErrorMsg('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div className="font-syne" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>
          NEURO<span style={{ color: '#00D2FF' }}>IT</span>
        </div>

        <h1
          className="font-syne"
          style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}
        >
          Welcome
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          Sign in to track your repairs and manage bookings.
        </p>

        {/* Google Sign In */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/portal' })}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: '#FFFFFF',
            color: 'var(--bg-color)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 700,
            fontFamily: 'var(--font-syne)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
            <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
            <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"/>
            <path d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8 8 0 001.83 5.41l2.67 2.07A4.77 4.77 0 018.98 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

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
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#00D2FF', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              Check Your Inbox!
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0' }}>
              We've sent a magic sign-in link to <strong>{email}</strong>. Click the link in the email to log in instantly.
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
          <>
            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Email login */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                placeholder="your@email.com"
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.875rem 1rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                aria-label="Email address"
              />
              <button
                onClick={handleEmailLogin}
                disabled={!email.trim() || isLoading}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: email.trim() && !isLoading ? '#00D2FF' : 'var(--surface-secondary)',
                  color: email.trim() && !isLoading ? 'var(--bg-color)' : '#888888',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: email.trim() && !isLoading ? 'pointer' : 'default',
                  fontWeight: 700,
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {isLoading ? '...' : 'Sign In'}
              </button>
            </div>
          </>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
          By continuing, you agree to our{' '}
          <Link href="/terms" style={{ color: '#00D2FF', textDecoration: 'none' }}>Terms</Link> and{' '}
          <Link href="/privacy" style={{ color: '#00D2FF', textDecoration: 'none' }}>Privacy Policy</Link>.
        </p>

        <Link
          href="/"
          style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
