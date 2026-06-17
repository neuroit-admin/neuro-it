'use client'

import { UserCheck, Shield, HeartHandshake, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const BADGES = [
  {
    icon: UserCheck,
    color: '#00D2FF',
    rgb: '0, 210, 255',
    title: 'Security Vetted Engineers',
    desc: 'All our technicians are security vetted and fully background-checked.',
  },
  {
    icon: Shield,
    color: '#8B5CF6',
    rgb: '139, 92, 246',
    title: '£1M Public Liability Insurance',
    desc: 'Fully insured for all work carried out in your home.',
  },
  {
    icon: HeartHandshake,
    color: '#22C55E',
    rgb: '34, 197, 94',
    title: 'No Fix, No Fee Guarantee',
    desc: "If we can't fix it, you don't pay. Simple.",
  },
]

export default function TrustBadges() {
  return (
    <section
      id="trust"
      style={{
        background: 'var(--surface)',
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {BADGES.map(({ icon: Icon, color, rgb, title, desc }, i) => (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                padding: '1.75rem 1.5rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                transition: 'border-color 0.3s, transform 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `rgba(${rgb}, 0.3)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `rgba(${rgb}, 0.06)`,
                  border: `1px solid rgba(${rgb}, 0.25)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px rgba(${rgb}, 0.08)`,
                  flexShrink: 0,
                  color: color,
                }}
              >
                <Icon size={22} />
              </motion.div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} aria-hidden="true" />
                  <h3
                    className="font-syne"
                    style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.98rem', margin: 0 }}
                  >
                    {title}
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
