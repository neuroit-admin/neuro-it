'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, CheckCircle } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
}

interface Props {
  faqs: FaqItem[]
}

export default function FaqClient({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-jetbrains)' }}>
        <Link href="/" style={{ color: '#00D2FF', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span>FAQ</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-syne)' }}>
          Got Questions?
        </span>
        <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
          Frequently Asked <span style={{ color: '#00D2FF' }}>Questions</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Quick answers to common queries about our home IT repair services in London.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '4rem' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${openIndex === i ? 'rgba(0,210,255,0.3)' : 'var(--border)'}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              aria-expanded={openIndex === i}
            >
              <span className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 }}>
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: '#00D2FF',
                  flexShrink: 0,
                  transform: openIndex === i ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.25s ease',
                }}
              />
            </button>
            {openIndex === i && (
              <div style={{ padding: '0 1.5rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, margin: '1rem 0 0' }}>
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA at bottom of FAQ */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, transparent 100%)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' }}>
        <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Still have questions?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Our team is available 7 days a week. Book a repair or get in touch directly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/book"
            style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#00D2FF', color: 'var(--bg-color)', textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.9rem', borderRadius: '4px' }}
          >
            Book a Repair
          </Link>
          <Link
            href="/contact"
            style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', borderRadius: '4px', border: '1px solid var(--border)' }}
          >
            Contact Us
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {['Same-day availability', 'DBS-checked engineers', 'No fix, no fee'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <CheckCircle size={13} style={{ color: '#22C55E' }} />
              {item}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
