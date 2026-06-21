'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function StickyBottomBar() {
  const [whatsappNumber, setWhatsappNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447519460614')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.whatsapp_number) {
          setWhatsappNumber(data.settings.whatsapp_number)
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div
      id="sticky-bottom-bar"
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(12, 12, 12, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hi, I need IT support`}
        target="_blank"
        rel="noopener noreferrer"
        id="bottom-whatsapp-btn"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.875rem 0.5rem',
          color: '#22C55E',
          textDecoration: 'none',
          fontSize: '0.7rem',
          fontWeight: 600,
          fontFamily: 'var(--font-syne)',
          letterSpacing: '0.05em',
          gap: '0.35rem',
          transition: 'background 0.2s ease',
        }}
      >
        <MessageCircle size={22} />
        WhatsApp
      </a>

      {/* Divider */}
      <div style={{ width: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />

      {/* Email */}
      <Link
        href="/contact"
        id="bottom-email-btn"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.875rem 0.5rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontSize: '0.7rem',
          fontWeight: 600,
          fontFamily: 'var(--font-syne)',
          letterSpacing: '0.05em',
          gap: '0.35rem',
        }}
      >
        <Mail size={22} />
        Email
      </Link>

      {/* Divider */}
      <div style={{ width: '1px', background: 'var(--border)', margin: '0.75rem 0' }} />

      {/* Book Now */}
      <Link
        href="/book"
        id="bottom-book-btn"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.875rem 0.5rem',
          color: '#00D2FF',
          textDecoration: 'none',
          fontSize: '0.7rem',
          fontWeight: 700,
          fontFamily: 'var(--font-syne)',
          letterSpacing: '0.05em',
          gap: '0.35rem',
        }}
      >
        <Calendar size={22} />
        Book Now
      </Link>
    </div>
  )
}
