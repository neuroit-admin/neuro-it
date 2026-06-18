'use client'

import React, { useState } from 'react'
import { Mail, Phone, MessageSquare, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ContactClient() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('LOADING')
    setErrorMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit form')
      setStatus('SUCCESS')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong')
      setStatus('ERROR')
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-syne)' }}>
          Get in Touch
        </span>
        <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          We&apos;re Here to <span style={{ color: '#00D2FF' }}>Help</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Have an issue or question? Reach out to our dispatchers or fill out the email form below.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        
        {/* Left Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={20} style={{ color: '#25D366' }} />
            </div>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>WhatsApp Chat</h3>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447700000000'}`} style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Chat with Dispatch (+44 7700 000000)</a>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={20} style={{ color: '#00D2FF' }} />
            </div>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Phone Support</h3>
              <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER || '02000000000'}`} style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Call 020 0000 0000</a>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={20} style={{ color: '#00D2FF' }} />
            </div>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Email Support</h3>
              <a href="mailto:neuroit.london@gmail.com" style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>neuroit.london@gmail.com</a>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={20} style={{ color: '#00D2FF' }} />
            </div>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Operating Hours</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                Mon - Fri: 8:00 AM - 8:00 PM<br />
                Sat: 9:00 AM - 5:00 PM | Sun: 10:00 AM - 4:00 PM
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Email Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          
          {status === 'SUCCESS' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Thank you for contacting us. Our dispatchers will review your request and get back to you shortly.
              </p>
              <button
                onClick={() => setStatus('IDLE')}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Email Us</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>Fill out this short form, and we will follow up with you as soon as possible.</p>
              
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Your Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 07700 000000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Description of Problem</label>
                <textarea
                  placeholder="Describe your issue or what support you need..."
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                  style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {status === 'ERROR' && (
                <div style={{ color: '#EF4444', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: '4px' }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'LOADING'}
                style={{ width: '100%', padding: '0.875rem', background: '#00D2FF', color: 'var(--bg-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-syne)' }}
              >
                {status === 'LOADING' ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Headquarters Info Details */}
      <div style={{ marginTop: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={22} style={{ color: '#00D2FF' }} />
          </div>
          <div>
            <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Service Headquarters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, margin: 0 }}>
              {process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Neuro IT'} • {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/book" style={{ display: 'inline-block', padding: '0.65rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'var(--font-syne)', borderRadius: '4px' }}>Book Online</Link>
        </div>
      </div>

    </div>
  )
}
