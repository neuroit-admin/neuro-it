'use client'

import { motion } from 'framer-motion'
import {
  AnimatedLaptop, AnimatedPcCase, AnimatedTerminal, AnimatedShield, AnimatedDatabase,
  AnimatedWifi, AnimatedHeadset, AnimatedSparkles, AnimatedApple, AnimatedZap
} from '@/components/icons/AnimatedIcons'

const CATEGORIES = [
  { slug: 'laptop-services', name: 'Laptop Services', icon: AnimatedLaptop, desc: 'Repair, screen, battery & more' },
  { slug: 'desktop-pc', name: 'Desktop / PC', icon: AnimatedPcCase, desc: 'PC repair, build & upgrade' },
  { slug: 'software-os', name: 'Software & OS', icon: AnimatedTerminal, desc: 'Windows, drivers, software' },
  { slug: 'virus-security', name: 'Virus & Security', icon: AnimatedShield, desc: 'Malware removal & hardening' },
  { slug: 'data-recovery', name: 'Data & Recovery', icon: AnimatedDatabase, desc: 'Files, HDD, cloud backup' },
  { slug: 'home-network', name: 'Home Network', icon: AnimatedWifi, desc: 'WiFi setup & troubleshooting' },
  { slug: 'remote-support', name: 'Remote Support', icon: AnimatedHeadset, desc: 'Fix issues without a visit' },
  { slug: 'new-device-setup', name: 'New Device Setup', icon: AnimatedSparkles, desc: 'Setup, migrate, configure' },
  { slug: 'apple-mac', name: 'Apple / Mac', icon: AnimatedApple, desc: 'MacBook, macOS, iPhone' },
  { slug: 'emergency', name: 'Emergency', icon: AnimatedZap, desc: 'Same-day & out-of-hours' },
]

const THEME_RGB_MAP: Record<string, string> = {
  'laptop-services': '0, 210, 255',
  'desktop-pc': '139, 92, 246',
  'software-os': '0, 210, 255',
  'virus-security': '239, 68, 68',
  'data-recovery': '245, 158, 11',
  'home-network': '34, 197, 94',
  'remote-support': '0, 210, 255',
  'new-device-setup': '139, 92, 246',
  'apple-mac': '163, 163, 163',
  'emergency': '239, 68, 68',
}

export default function ServicesGrid() {
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <section
      id="services"
      style={{
        background: 'var(--bg-color)',
        padding: '5rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            className="font-syne"
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}
          >
            Everything IT, Covered
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            From laptop repairs to emergency callouts — we handle it all.
          </p>
        </div>

        <div
          style={{
            gap: '1.25rem',
          }}
          className="grid grid-cols-2 md:grid-cols-5"
        >
          {CATEGORIES.map(({ slug, name, icon: Icon, desc }) => {
            const rgb = THEME_RGB_MAP[slug] || '0, 210, 255'
            return (
              <motion.a
                key={slug}
                href={`/services/${slug}`}
                id={`service-card-${slug}`}
                whileHover="hover"
                onMouseMove={handleMouseMove}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '2rem 1.25rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = `rgba(${rgb}, 0.4)`
                  el.style.boxShadow = `0 8px 32px rgba(${rgb}, 0.15)`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = 'var(--border)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Spotlight background glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle 100px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${rgb}, 0.1), transparent 80%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />

                <span style={{ color: `rgb(${rgb})`, display: 'flex', alignItems: 'center', zIndex: 1 }}>
                  <Icon size={32} />
                </span>
                
                <div style={{ zIndex: 1 }}>
                  <p
                    className="font-syne"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {name}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4, margin: 0 }}>{desc}</p>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
