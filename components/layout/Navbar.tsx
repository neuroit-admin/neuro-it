'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/theme/ThemeToggle'
import {
  AnimatedLaptop, AnimatedPcCase, AnimatedTerminal, AnimatedShield, AnimatedDatabase,
  AnimatedWifi, AnimatedHeadset, AnimatedSparkles, AnimatedApple, AnimatedZap
} from '@/components/icons/AnimatedIcons'

import TrackWidget from './TrackWidget'

const MEGA_CATEGORIES = [
  { name: 'Laptop Repair & Services', slug: 'laptop-services', desc: 'Screen repair, battery replacement & keyboard fixes.', color: '#00D2FF', icon: AnimatedLaptop },
  { name: 'Desktop PC & Custom Builds', slug: 'desktop-pc', desc: 'Hardware diagnostics, upgrades, thermal pasting & custom assembly.', color: '#8B5CF6', icon: AnimatedPcCase },
  { name: 'Software & OS Support', slug: 'software-os', desc: 'Windows/Linux reinstalls, boot diagnostics, speed optimization.', color: '#00D2FF', icon: AnimatedTerminal },
  { name: 'Virus & Cyber Security', slug: 'virus-security', desc: 'Malware removal, secure browser setups, privacy hardening.', color: '#EF4444', icon: AnimatedShield },
  { name: 'Data Recovery & Backup', slug: 'data-recovery', desc: 'Recover deleted files, failing drive extraction, local/cloud backups.', color: '#F59E0B', icon: AnimatedDatabase },
  { name: 'Home Network & WiFi Setup', slug: 'home-network', desc: 'WiFi range extensions, router setups, smart TV connectivity.', color: '#22C55E', icon: AnimatedWifi },
  { name: 'Remote Tech Support', slug: 'remote-support', desc: 'Instant screen sharing assistance for software & configurations.', color: '#00D2FF', icon: AnimatedHeadset },
  { name: 'New Device Setup', slug: 'new-device-setup', desc: 'Data migration, printer connection, email sync & initial config.', color: '#8B5CF6', icon: AnimatedSparkles },
  { name: 'Apple Mac Support', slug: 'apple-mac', desc: 'MacBook & iMac screen repair, macOS installs, battery swaps.', color: '#A3A3A3', icon: AnimatedApple },
  { name: 'Emergency Support', slug: 'emergency', desc: 'Priority out-of-hours assistance for critical system failures.', color: '#EF4444', icon: AnimatedZap },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeHoverMenu, setActiveHoverMenu] = useState<'services' | 'how-it-works' | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTrackOpen, setIsTrackOpen] = useState(false)

  const primaryLinks = [
    { href: '/services', label: 'Services & Pricing' },
    { href: '/how-it-works', label: 'How It Works' },
  ]

  const dropdownLinks = [
    { href: '/areas', label: 'Coverage Areas' },
    { href: '/blog', label: 'Blog & Articles' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
  ]

  const [focusedIndex, setFocusedIndex] = useState(-1)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (isDropdownOpen && focusedIndex >= 0 && linkRefs.current[focusedIndex]) {
      linkRefs.current[focusedIndex]?.focus()
    }
  }, [isDropdownOpen, focusedIndex])

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsDropdownOpen(true)
      setFocusedIndex(0)
    }
  }

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsDropdownOpen(false)
      setFocusedIndex(-1)
      moreButtonRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => (prev + 1) % dropdownLinks.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => (prev - 1 + dropdownLinks.length) % dropdownLinks.length)
    } else if (e.key === 'Tab') {
      setIsDropdownOpen(false)
      setFocusedIndex(-1)
    }
  }

  const mobileLinks = [
    ...primaryLinks,
    ...dropdownLinks,
  ]

  if (status === 'authenticated') {
    mobileLinks.push({ href: '/portal', label: 'My Portal' })
  } else {
    mobileLinks.push({ href: '/login', label: 'Sign In' })
  }

  return (
    <nav
      id="main-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        ...(isScrolled
          ? {
              background: 'var(--surface)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border)',
            }
          : {
              background: 'transparent',
            }),
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
          }}
        >
          NEURO<span style={{ color: 'var(--accent)' }}>IT</span>
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            alignItems: 'center',
            gap: '2rem',
          }}
          className="hidden md:flex"
        >
          {/* Services & Pricing Link + Mega Menu */}
          <div
            onMouseEnter={() => setActiveHoverMenu('services')}
            onMouseLeave={() => setActiveHoverMenu(null)}
            style={{ position: 'relative', padding: '0.5rem 0' }}
          >
            <Link
              href="/services"
              style={{
                color: activeHoverMenu === 'services' ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Services &amp; Pricing
              <ChevronDown size={12} style={{ transform: activeHoverMenu === 'services' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
            </Link>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
              {activeHoverMenu === 'services' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="mobile-menu-card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '-200px',
                    width: '640px',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    zIndex: 1000,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {MEGA_CATEGORIES.map(cat => {
                    const Icon = cat.icon
                    return (
                      <motion.div
                        whileHover="hover"
                        key={cat.slug}
                      >
                        <Link
                          href={`/services#s-${cat.slug}`}
                          onClick={() => setActiveHoverMenu(null)}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <span style={{ color: cat.color, marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                            <Icon size={18} />
                          </span>
                          <div>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.15rem 0' }}>{cat.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, lineHeight: 1.3 }}>{cat.desc}</p>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How It Works Link + Dropdown */}
          <div
            onMouseEnter={() => setActiveHoverMenu('how-it-works')}
            onMouseLeave={() => setActiveHoverMenu(null)}
            style={{ position: 'relative', padding: '0.5rem 0' }}
          >
            <Link
              href="/how-it-works"
              style={{
                color: activeHoverMenu === 'how-it-works' ? 'var(--text-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              How It Works
              <ChevronDown size={12} style={{ transform: activeHoverMenu === 'how-it-works' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
            </Link>

            {/* How It Works Dropdown Panel */}
            <AnimatePresence>
              {activeHoverMenu === 'how-it-works' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className="mobile-menu-card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '-80px',
                    width: '320px',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-syne)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: 0 }}>
                    Our Process
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>📞</span>
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 0.1rem 0' }}>1. Book in 60s</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, lineHeight: 1.3 }}>Select a slot online or drop a quick WhatsApp text.</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>🔍</span>
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 0.1rem 0' }}>2. Free Diagnostics</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, lineHeight: 1.3 }}>Our engineer inspects the issue and gives a quote.</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>🛠️</span>
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 0.1rem 0' }}>3. Same-Day Fix</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, lineHeight: 1.3 }}>We repair onsite or collect/return for workshop fixes.</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.1rem', marginTop: '-2px' }}>💳</span>
                      <div>
                        <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 0.1rem 0' }}>4. No Fix No Fee</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, lineHeight: 1.3 }}>Zero risk. You only pay after a successful tech repair.</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/how-it-works"
                    onClick={() => setActiveHoverMenu(null)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      background: 'rgba(0, 210, 255, 0.08)',
                      color: '#00D2FF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      marginTop: '0.25rem',
                      fontFamily: 'var(--font-syne)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.08)'}
                  >
                    Learn More &rarr;
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* More Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => {
              setIsDropdownOpen(false)
              setFocusedIndex(-1)
            }}
          >
            <button
              ref={moreButtonRef}
              onKeyDown={handleButtonKeyDown}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              style={{
                background: 'transparent',
                border: 'none',
                color: isDropdownOpen ? '#00D2FF' : '#888888',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                letterSpacing: '0.05em',
                padding: '0.5rem 0',
                transition: 'color 0.2s ease',
                outline: 'none',
              }}
            >
              More <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {isDropdownOpen && (
              <div
                onKeyDown={handleDropdownKeyDown}
                className="mobile-menu-card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  width: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                  zIndex: 1010,
                }}
              >
                {dropdownLinks.map(({ href, label }, idx) => (
                  <Link
                    key={href}
                    ref={el => { linkRefs.current[idx] = el }}
                    href={href}
                    style={{
                      color: focusedIndex === idx ? '#00D2FF' : 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '2px',
                      background: focusedIndex === idx ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                      outline: 'none',
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {status === 'authenticated' ? (
            <Link
              href="/portal"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-muted)')}
            >
              My Portal
            </Link>
          ) : (
            <>
              <button
                onClick={() => setIsTrackOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.05em',
                  padding: 0,
                  outline: 'none'
                }}
                onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'var(--text-muted)')}
              >
                Track Repair
              </button>
              <Link
                href="/login"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = 'var(--text-muted)')}
              >
                Sign In
              </Link>
            </>
          )}

          {status === 'authenticated' && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'color 0.2s ease',
                letterSpacing: '0.05em',
                padding: 0,
              }}
              onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'var(--text-muted)')}
            >
              Sign Out
            </button>
          )}


          <ThemeToggle />

          <Link
            href="/book"
            id="nav-book-btn"
            className="glass-glow-btn"
          >
            Get Help Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            zIndex: 1001,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <motion.path
              animate={isMenuOpen ? { d: "M 3 18 L 21 6" } : { d: "M 3 5 L 21 5" }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            />
            <motion.path
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              d="M 3 12 L 21 12"
              transition={{ duration: 0.15 }}
            />
            <motion.path
              animate={isMenuOpen ? { d: "M 3 6 L 21 18" } : { d: "M 3 19 L 21 19" }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu drawer and backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.27)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                zIndex: 999,
              }}
            />

            {/* Floating Glass Box Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="mobile-menu-card"
              style={{
                position: 'fixed',
                top: '80px',
                right: '16px',
                width: '280px',
                maxWidth: 'calc(100vw - 32px)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                transformOrigin: 'top right',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 100px)',
              }}
            >
              {/* Theme Toggle in drawer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <ThemeToggle />
              </div>

              {/* Links container */}
              <motion.div
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.05,
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
              >
                {[...primaryLinks, ...dropdownLinks].map(({ href, label }) => (
                  <motion.div
                    key={href}
                    variants={{
                      hidden: { x: 30, opacity: 0 },
                      show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                    }}
                  >
                    <Link
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        padding: '0.85rem 0',
                        fontSize: '1.05rem',
                        borderBottom: '1px solid var(--border)',
                        fontFamily: 'var(--font-syne)',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}

                {status === 'authenticated' ? (
                  <motion.div
                    variants={{
                      hidden: { x: 30, opacity: 0 },
                      show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                    }}
                  >
                    <Link
                      href="/portal"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '0.85rem 0',
                        fontSize: '1.05rem',
                        borderBottom: '1px solid var(--border)',
                        fontFamily: 'var(--font-syne)',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      My Portal
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      variants={{
                        hidden: { x: 30, opacity: 0 },
                        show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsTrackOpen(true)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          padding: '0.85rem 0',
                          fontSize: '1.05rem',
                          borderBottom: '1px solid var(--border)',
                          fontFamily: 'var(--font-syne)',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        Track Repair
                      </button>
                    </motion.div>
                    <motion.div
                      variants={{
                        hidden: { x: 30, opacity: 0 },
                        show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                      }}
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                          display: 'block',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          padding: '0.85rem 0',
                          fontSize: '1.05rem',
                          borderBottom: '1px solid var(--border)',
                          fontFamily: 'var(--font-syne)',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  </>
                )}

                {status === 'authenticated' && (
                  <motion.div
                    variants={{
                      hidden: { x: 30, opacity: 0 },
                      show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        padding: '0.85rem 0',
                        fontSize: '1.05rem',
                        borderBottom: '1px solid var(--border)',
                        fontFamily: 'var(--font-syne)',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}

                <motion.div
                  variants={{
                    hidden: { x: 30, opacity: 0 },
                    show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                  }}
                  style={{ marginTop: '1.5rem' }}
                >
                  <Link
                    href="/book"
                    onClick={() => setIsMenuOpen(false)}
                    className="glass-glow-btn"
                    style={{ display: 'block' }}
                  >
                    Get Help Now
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Track Repair Modal Overlay */}
      <TrackWidget isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </nav>
  )
}
