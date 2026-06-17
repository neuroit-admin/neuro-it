'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'

interface TrackFormProps {
  variant?: 'compact' | 'stacked'
  onSuccess?: () => void
}

export default function TrackForm({ variant = 'stacked', onSuccess }: TrackFormProps) {
  const [trackRef, setTrackRef] = useState('')
  const [trackEmail, setTrackEmail] = useState('')
  const [trackError, setTrackError] = useState('')
  const [trackLoading, setTrackLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 1. Clean up expired __nit_tk_ tokens
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('__nit_tk_')) {
            const val = localStorage.getItem(key)
            if (val) {
              const data = JSON.parse(val)
              if (data && data.expires && Date.now() > data.expires) {
                keysToRemove.push(key)
              }
            }
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // 2. Auto-fill from latest valid token if available (only for stacked variant)
        if (variant === 'stacked') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('__nit_tk_')) {
              const ref = key.replace('__nit_tk_', '')
              setTrackRef(ref)
              break
            }
          }
        }
      } catch (err) {
        console.warn('LocalStorage token operations failed:', err)
      }
    }
  }, [variant])

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackRef.trim() || !trackEmail.trim()) return
    setTrackLoading(true)
    setTrackError('')
    try {
      const res = await fetch('/api/tickets/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: trackRef, email: trackEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No active repair request was found matching details.')
      
      if (typeof window !== 'undefined') {
        try {
          // Store token with 30 days expiry
          const expires = Date.now() + 30 * 24 * 60 * 60 * 1000
          localStorage.setItem(`__nit_tk_${data.ticket.referenceCode}`, JSON.stringify({ token: data.ticket.securityToken, expires }))
        } catch (err) {
          console.warn('Failed to store tracking token:', err)
        }
      }

      if (onSuccess) onSuccess()
      window.location.href = `/portal/ticket/${data.ticket.id}?token=${data.ticket.securityToken}`
    } catch (err: any) {
      setTrackError(err.message || 'Verification failed. Please double-check details.')
    } finally {
      setTrackLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '280px' }}>
        <input 
          type="text" 
          placeholder="Ticket Ref (e.g. NEURO-2026-ABCD)" 
          value={trackRef}
          onChange={e => { setTrackRef(e.target.value); setTrackError('') }}
          required
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={trackEmail}
            onChange={e => { setTrackEmail(e.target.value); setTrackError('') }}
            required
            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '2px', padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button 
            type="submit" 
            disabled={trackLoading}
            style={{ background: '#00D2FF', color: 'var(--bg-color)', border: 'none', borderRadius: '2px', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            {trackLoading ? '...' : 'Track'}
          </button>
        </div>
        {trackError && <p style={{ color: '#EF4444', fontSize: '0.7rem', margin: 0 }}>{trackError}</p>}
      </form>
    )
  }

  // Stacked variant (used in modal and dedicated track page)
  return (
    <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Reference Code
        </label>
        <input 
          type="text" 
          placeholder="e.g. NEURO-2026-ABCD"
          value={trackRef}
          onChange={e => { setTrackRef(e.target.value); setTrackError('') }}
          required
          style={{
            width: '100%', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem',
            outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-jetbrains)'
          }}
          onFocus={e => e.target.style.borderColor = '#00D2FF'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Email Address
        </label>
        <input 
          type="email" 
          placeholder="john@example.com"
          value={trackEmail}
          onChange={e => { setTrackEmail(e.target.value); setTrackError('') }}
          required
          style={{
            width: '100%', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem',
            outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#00D2FF'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {trackError && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#EF4444', fontSize: '0.8rem', padding: '0.75rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '4px' }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{trackError}</span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={trackLoading}
        style={{
          width: '100%', padding: '0.875rem', background: '#00D2FF', color: 'var(--bg-color)',
          border: 'none', borderRadius: '4px', cursor: trackLoading ? 'default' : 'pointer',
          fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-syne)',
          letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => { if (!trackLoading) e.currentTarget.style.background = '#0099BB' }}
        onMouseLeave={e => { if (!trackLoading) e.currentTarget.style.background = '#00D2FF' }}
      >
        {trackLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Verifying details...</span>
          </>
        ) : (
          <>
            <Search size={16} />
            <span>Track Repair Status</span>
          </>
        )}
      </button>
    </form>
  )
}
