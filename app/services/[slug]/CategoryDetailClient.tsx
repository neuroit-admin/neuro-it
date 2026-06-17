'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Laptop } from 'lucide-react'
import {
  AnimatedLaptop, AnimatedPcCase, AnimatedTerminal, AnimatedShield, AnimatedDatabase,
  AnimatedWifi, AnimatedHeadset, AnimatedSparkles, AnimatedApple, AnimatedZap
} from '@/components/icons/AnimatedIcons'

const MotionLink = motion(Link)

const ICON_MAP: Record<string, any> = {
  'laptop-services': AnimatedLaptop,
  'desktop-pc': AnimatedPcCase,
  'software-os': AnimatedTerminal,
  'virus-security': AnimatedShield,
  'data-recovery': AnimatedDatabase,
  'home-network': AnimatedWifi,
  'remote-support': AnimatedHeadset,
  'new-device-setup': AnimatedSparkles,
  'apple-mac': AnimatedApple,
  'emergency': AnimatedZap
}

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

const THEME_MAP: Record<string, { color: string; bgGlow: string; borderHover: string; pillBg: string }> = {
  'laptop-services': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'desktop-pc': { color: '#8B5CF6', bgGlow: 'rgba(139, 92, 246, 0.08)', borderHover: 'rgba(139, 92, 246, 0.3)', pillBg: 'rgba(139, 92, 246, 0.08)' },
  'software-os': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'virus-security': { color: '#EF4444', bgGlow: 'rgba(239, 68, 68, 0.08)', borderHover: 'rgba(239, 68, 68, 0.3)', pillBg: 'rgba(239, 68, 68, 0.08)' },
  'data-recovery': { color: '#F59E0B', bgGlow: 'rgba(245, 158, 11, 0.08)', borderHover: 'rgba(245, 158, 11, 0.3)', pillBg: 'rgba(245, 158, 11, 0.08)' },
  'home-network': { color: '#22C55E', bgGlow: 'rgba(34, 197, 94, 0.08)', borderHover: 'rgba(34, 197, 94, 0.3)', pillBg: 'rgba(34, 197, 94, 0.08)' },
  'remote-support': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'new-device-setup': { color: '#8B5CF6', bgGlow: 'rgba(139, 92, 246, 0.08)', borderHover: 'rgba(139, 92, 246, 0.3)', pillBg: 'rgba(139, 92, 246, 0.08)' },
  'apple-mac': { color: '#A3A3A3', bgGlow: 'rgba(163, 163, 163, 0.08)', borderHover: 'rgba(163, 163, 163, 0.3)', pillBg: 'rgba(163, 163, 163, 0.08)' },
  'emergency': { color: '#EF4444', bgGlow: 'rgba(239, 68, 68, 0.08)', borderHover: 'rgba(239, 68, 68, 0.3)', pillBg: 'rgba(239, 68, 68, 0.08)' },
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Laptop Services': 'DBS-checked, certified engineers for laptop screen replacement, battery upgrades, water damage recovery, and hardware repairs across London.',
  'Desktop / PC': 'Professional home desktop support. Component diagnostics, custom builds assembly, graphics card repairs, and gaming PC upgrades.',
  'Software & OS': 'Clean operating system installations, driver setup, software activation, password recovery, and email synchronization.',
  'Virus & Security': 'Eradicate active security threats. Malware scan, ransomware decrypts, safety audits, and two-factor configuration.',
  'Data & Recovery': 'Recover photos, folders, and arrays from failed drives. Automated cloud backup configuration and secure migration.',
  'Home Network': 'Setup internet routers, mesh systems, smart switches, and Synology NAS server libraries. Eliminate weak WiFi spots.',
  'Remote Support': 'Instant screen share diagnostics. Solve application configurations and settings issues without home visit delays.',
  'New Device Setup': 'Professional unboxing and data transfers. Setup new laptops, PCs, iPhones, and Smart TVs.',
  'Apple / Mac': 'Specialist Apple repair services. MacBook displays, batteries, macOS installations, and iPhone repairs.',
  'Emergency': 'Instant weekend, evening, and bank holiday dispatch slots. Priority response for critical failures.',
}

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  basePriceMin: number
  basePriceMax: number
  callOutFee: number
  isEmergencyReady: boolean
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  isActive: boolean
  displayOrder: number
  services: Service[]
}

interface Props {
  currentCategory: Category
  otherCategories: Category[]
}

export default function CategoryDetailClient({ currentCategory, otherCategories }: Props) {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  // Get service duration text logically
  const getServiceDurationText = (svc: Service) => {
    const nameLower = svc.name.toLowerCase()
    const descLower = (svc.description || '').toLowerCase()
    if (nameLower.includes('emergency') || nameLower.includes('out-of-hours')) return 'Within 2-3 hrs'
    if (nameLower.includes('critical')) return 'Within 1 hr'
    if (nameLower.includes('recovery') || nameLower.includes('raid')) return '1–3 days'
    if (nameLower.includes('custom') || nameLower.includes('build')) return 'Next day'
    if (nameLower.includes('reinstall') || nameLower.includes('smart tv') || descLower.includes('migration')) return '2–3 hrs'
    if (nameLower.includes('diagnostics') || nameLower.includes('paste') || nameLower.includes('dust') || nameLower.includes('ram') || nameLower.includes('battery') || nameLower.includes('keyboard')) return '1–2 hrs'
    return 'Same day'
  }

  const Icon = ICON_MAP[currentCategory.slug] || Laptop
  const theme = THEME_MAP[currentCategory.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)', borderHover: 'var(--border)', pillBg: 'var(--surface-secondary)' }
  const description = CATEGORY_DESCRIPTIONS[currentCategory.name] || ''

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Back button */}
      <Link
        href="/services"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          marginBottom: '2rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = '#00D2FF' }}
        onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = '#888888' }}
      >
        <ArrowLeft size={16} /> Back to all services
      </Link>

      <div style={{ gap: '2rem' }} className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
        
        {/* MAIN CONTENT AREA */}
        <div>
          {/* Hero Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '3rem' }}>
            <motion.div 
              whileHover="hover"
              style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bgGlow, border: `1px solid ${theme.borderHover}`, color: theme.color, paddingLeft: '20px', flexShrink: 0, cursor: 'default' }}
            >
              <Icon size={28} />
            </motion.div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-jetbrains)' }}>
                <Link href="/services" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Services</Link>
                <span>/</span>
                <span style={{ color: theme.color }}>{currentCategory.name}</span>
              </div>
              <h1 className="font-syne" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                {currentCategory.name === 'Emergency' ? 'Emergency & Out-of-Hours' : currentCategory.name}
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                {description}
              </p>
            </div>
          </div>

          {/* Services List Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {currentCategory.services.map(svc => {
              const duration = getServiceDurationText(svc)
              const rgb = THEME_RGB_MAP[currentCategory.slug] || '0, 210, 255'
              return (
                <div
                  key={svc.slug}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={e => {
                    const card = e.currentTarget as HTMLDivElement
                    card.style.borderColor = theme.color
                    card.style.transform = 'translateY(-3px)'
                    card.style.boxShadow = `0 10px 30px rgba(${rgb}, 0.15)`
                  }}
                  onMouseLeave={e => {
                    const card = e.currentTarget as HTMLDivElement
                    card.style.borderColor = 'var(--border)'
                    card.style.transform = 'none'
                    card.style.boxShadow = 'none'
                  }}
                  style={{
                    background: `radial-gradient(circle 140px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${rgb}, 0.12), transparent 85%), var(--surface)`,
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 className="font-syne" style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                      {svc.name}
                    </h3>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', background: theme.pillBg, color: theme.color, whiteSpace: 'nowrap' }}>
                      {duration}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {svc.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.85rem', fontWeight: 700, color: theme.color }}>
                      {svc.basePriceMin === svc.basePriceMax ? `£${svc.basePriceMin}` : `From £${svc.basePriceMin}`}
                    </span>
                    <Link
                      href={`/book?service=${svc.slug}&cat=${currentCategory.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.45rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        background: theme.bgGlow,
                        color: theme.color,
                        border: `1px solid ${theme.borderHover}`,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget as HTMLAnchorElement
                        btn.style.background = theme.color
                        btn.style.color = '#000000'
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget as HTMLAnchorElement
                        btn.style.background = theme.bgGlow
                        btn.style.color = theme.color
                      }}
                    >
                      Book now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SIDEBAR FOR OTHER CATEGORIES */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
            <h4 className="font-syne" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 700 }}>Other Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {otherCategories.map(cat => {
                const CatIcon = ICON_MAP[cat.slug] || Laptop
                return (
                  <MotionLink
                    whileHover="hover"
                    key={cat.slug}
                    href={`/services/${cat.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      const link = e.currentTarget as HTMLAnchorElement
                      link.style.background = 'var(--surface-secondary)'
                      link.style.color = '#E0E0E0'
                    }}
                    onMouseLeave={e => {
                      const link = e.currentTarget as HTMLAnchorElement
                      link.style.background = 'transparent'
                      link.style.color = '#888888'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <CatIcon size={14} />
                    </span>
                    {cat.name}
                  </MotionLink>
                )
              })}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
            <h4 className="font-syne" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 700 }}>Areas We Service</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '1rem' }}>
              Certified local technicians available for home visits and repair in these boroughs:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { slug: 'hackney', name: 'Hackney' },
                { slug: 'camden', name: 'Camden' },
                { slug: 'islington', name: 'Islington' },
                { slug: 'enfield', name: 'Enfield' },
                { slug: 'haringey', name: 'Haringey' },
                { slug: 'barnet', name: 'Barnet' },
                { slug: 'westminster', name: 'Westminster' },
                { slug: 'tower-hamlets', name: 'Tower Hamlets' }
              ].map(area => (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  style={{
                    fontSize: '0.8rem',
                    color: '#B0B0B0',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00D2FF' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#B0B0B0' }}
                >
                  {area.name}
                </Link>
              ))}
            </div>
            <Link
              href="/areas"
              style={{
                color: '#00D2FF',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '1rem',
                display: 'block',
              }}
            >
              View All Coverage Areas →
            </Link>
          </div>

          <div style={{ background: 'linear-gradient(to bottom, #121212, #1C1C1C)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
            <h4 className="font-syne" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>No Fix, No Fee Guarantee</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              All of our visits are backed by a risk-free policy. If we can't diagnose or repair the fault, you pay absolutely nothing.
            </p>
            <Link
              href={`/book?cat=${currentCategory.slug}`}
              style={{
                display: 'block',
                padding: '0.75rem',
                background: '#00D2FF',
                color: 'var(--bg-color)',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLAnchorElement).style.background = '#0099BB' }}
              onMouseLeave={e => { (e.target as HTMLAnchorElement).style.background = '#00D2FF' }}
            >
              Start Booking
            </Link>
          </div>
        </aside>

      </div>
    </div>
  )
}
