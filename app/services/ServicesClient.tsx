'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Laptop, Search, ShieldCheck, HelpCircle, X,
  Layers, Coins, HeartHandshake, Grid
} from 'lucide-react'
import {
  AnimatedLaptop, AnimatedPcCase, AnimatedTerminal, AnimatedShield, AnimatedDatabase,
  AnimatedWifi, AnimatedHeadset, AnimatedSparkles, AnimatedApple, AnimatedZap
} from '@/components/icons/AnimatedIcons'
import Link from 'next/link'


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

interface ServicesClientProps {
  initialCategories: Category[]
}

export default function ServicesClient({ initialCategories }: ServicesClientProps) {
  const [categories] = useState<Category[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(initialCategories.map(c => c.slug))
  const [expandedServices, setExpandedServices] = useState<string[]>([])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle Spotlight Mouse-Follow Glow Coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const toggleService = (slug: string) => {
    setExpandedServices(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  // Keep track of scroll positions for active category state
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 180 // threshold from viewport top
      let currentSection = ''
      
      for (let i = 0; i < categories.length; i++) {
        const el = document.getElementById(`s-${categories[i].slug}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          // If the section top is above the threshold, it is the active candidate
          if (rect.top <= threshold) {
            currentSection = categories[i].slug
          }
        }
      }
      
      // Default to first category if user is scrolled near the top of the page
      if (window.scrollY < 200) {
        currentSection = categories[0]?.slug || ''
      }
      
      if (currentSection) {
        setActiveSection(currentSection)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Run immediately on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [categories])

  const scrollTo = (slug: string) => {
    const el = document.getElementById(`s-${slug}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter)
    if (filter !== 'all') {
      setTimeout(() => scrollTo(filter), 150)
    }
  }

  // Get service duration text logically based on service name or description
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

  // Filter services by search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase().trim()
    return categories
      .map(cat => {
        const filteredServices = cat.services.filter(svc => {
          return (
            svc.name.toLowerCase().includes(query) ||
            (svc.description || '').toLowerCase().includes(query) ||
            svc.slug.toLowerCase().includes(query)
          )
        })
        return { ...cat, services: filteredServices }
      })
      .filter(cat => cat.services.length > 0)
  }

  const filteredCategories = getFilteredCategories()
  const hasResults = filteredCategories.length > 0

  return (
    <>
      <style>{`
        /* Hide default scrollbars for category tabs */
        .flex-no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .flex-no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Smooth spotlight border glow */
        .spotlight-card {
          position: relative;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        
        .spotlight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
        }
      `}</style>

      {/* HERO */}
      <section style={{ padding: '5rem 2rem 2.25rem', background: 'radial-gradient(ellipse at 50% 0%, rgba(0,210,255,0.06) 0%, transparent 60%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Hero Content */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-jetbrains)' }}>
              <Link href="/" style={{ color: '#00D2FF', textDecoration: 'none' }}>Home</Link>
              <span>/</span>
              <span>Services &amp; Pricing</span>
            </div>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Expert Services,<br /><span style={{ color: '#00D2FF' }}>Transparent Pricing</span>
            </h1>
            <p className="hidden md:block" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              Browse our range of professional home IT support services in London. Vetted engineers, clear price boundaries, and our signature No Fix No Fee guarantee.
            </p>
          </div>

        </div>
      </section>

      {/* MAIN BODY GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ gap: '2rem' }} className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          
          {/* SIDEBAR (Sticky Desktop only) */}
          <aside className="hidden md:block" style={{ position: 'sticky', top: '80px', padding: '2rem 0', borderRight: '1px solid rgba(255,255,255,0.06)', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 1.5rem', marginBottom: '0.75rem' }}>
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {categories.map(cat => {
                const Icon = ICON_MAP[cat.slug] || Laptop
                const theme = THEME_MAP[cat.slug] || { color: '#00D2FF' }
                const rgb = THEME_RGB_MAP[cat.slug] || '0, 210, 255'
                const isActive = activeSection === cat.slug || activeFilter === cat.slug
                return (
                  <motion.button
                    whileHover="hover"
                    key={cat.slug}
                    onClick={() => scrollTo(cat.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.875rem',
                      color: isActive ? theme.color : '#888888',
                      background: isActive ? `rgba(${rgb}, 0.05)` : 'transparent',
                      borderLeft: `2px solid ${isActive ? theme.color : 'transparent'}`,
                      borderTop: 'none',
                      borderRight: 'none',
                      borderBottom: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ color: theme.color, display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.75 }}>
                      <Icon size={22} />
                    </span>
                    {cat.name}
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      {cat.services.length}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 1.5rem', marginBottom: '0.75rem', marginTop: '2rem' }}>
              Quick Actions
            </div>
            <Link
              href={activeSection ? `/book?cat=${activeSection}` : activeFilter !== 'all' ? `/book?cat=${activeFilter}` : '/book'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1.5rem',
                fontSize: '0.875rem',
                color: '#00D2FF',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              ⚡ Book a Repair
            </Link>

            {/* Trust Badges in Sidebar */}
            <div style={{ padding: '0 1.5rem', marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Guarantees
              </div>
              
              {/* Item 1 */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Layers size={15} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600 }}>50+ Services</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: 1.3 }}>Complete hardware &amp; software support</p>
                </div>
              </div>

              {/* Item 2 */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={15} style={{ color: '#22C55E', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600 }}>DBS-Checked</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: 1.3 }}>Fully vetted home technicians</p>
                </div>
              </div>

              {/* Item 3 */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Coins size={15} style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600 }}>Transparent Pricing</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: 1.3 }}>Clear price bounds before booking</p>
                </div>
              </div>

              {/* Item 4 */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <HeartHandshake size={15} style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h5 style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600 }}>No Fix, No Fee</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', lineHeight: 1.3 }}>Risk-free diagnostics guarantee</p>
                </div>
              </div>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <div style={{ padding: '2rem 0 6rem' }} className="md:pl-8">
            
            {/* Unified Search & Category Filter Bar */}
            <div 
              ref={dropdownRef}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center', 
                marginBottom: '1rem',
                position: 'relative'
              }}
            >
              {/* Search input */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.65rem 1rem' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search services — e.g. screen repair, virus, WiFi setup..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Dropdown Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsMobileFilterOpen(true)
                    } else {
                      setIsDropdownOpen(!isDropdownOpen)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#00D2FF'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Layers size={16} style={{ color: '#00D2FF' }} />
                  <span>
                    {activeFilter === 'all' ? 'All Services' : categories.find(c => c.slug === activeFilter)?.name || 'Categories'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>▼</span>
                </button>

                {/* Desktop Dropdown Menu Overlay */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    zIndex: 100,
                    background: 'rgba(15, 15, 20, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    minWidth: '220px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}>
                    <button
                      onClick={() => { handleFilterClick('all'); setIsDropdownOpen(false) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.66rem 0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: activeFilter === 'all' ? 'rgba(0,210,255,0.08)' : 'transparent',
                        color: activeFilter === 'all' ? '#00D2FF' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: activeFilter === 'all' ? 600 : 500,
                        textAlign: 'left',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        if (activeFilter !== 'all') {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (activeFilter !== 'all') {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--text-secondary)'
                        }
                      }}
                    >
                      <Grid size={14} />
                      All Services
                    </button>
                    {categories.map(cat => {
                      const Icon = ICON_MAP[cat.slug] || Laptop
                      const isActive = activeFilter === cat.slug
                      const theme = THEME_MAP[cat.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)' }
                      return (
                        <motion.button
                          whileHover="hover"
                          key={cat.slug}
                          onClick={() => { handleFilterClick(cat.slug); setIsDropdownOpen(false) }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.66rem 0.85rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: isActive ? theme.bgGlow : 'transparent',
                            color: isActive ? theme.color : 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 600 : 500,
                            textAlign: 'left',
                            width: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ color: theme.color, display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>
                            <Icon size={18} />
                          </span>
                          {cat.name}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer Text below the Search/Filter bar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '2.5rem', padding: '0 0.25rem' }}>
              <HelpCircle size={14} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0, opacity: 0.8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.45, margin: 0, fontStyle: 'italic', textAlign: 'left' }}>
                All starting rates include labor and standard parts. Prices vary by device model (e.g. PC vs. MacBook) and are confirmed on-site before work starts.
              </p>
            </div>

            {!hasResults ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
                <h3 className="font-syne" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No services found</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  Try a different search term, or{' '}
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#00D2FF', cursor: 'pointer', textDecoration: 'underline' }}>
                    clear search
                  </button>{' '}
                  to see all services.
                </p>
              </div>
            ) : (
              filteredCategories.map(cat => {
                const Icon = ICON_MAP[cat.slug] || Laptop
                const theme = THEME_MAP[cat.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)', borderHover: 'var(--border)', pillBg: 'var(--surface-secondary)' }
                const rgb = THEME_RGB_MAP[cat.slug] || '0, 210, 255'

                // Only show section if filtering matches
                if (activeFilter !== 'all' && activeFilter !== cat.slug) return null

                const isExpanded = searchQuery.trim().length > 0 || expandedCategories.includes(cat.slug)
                return (
                  <section
                    key={cat.slug}
                    id={`s-${cat.slug}`}
                    style={{ marginBottom: isExpanded ? '3.5rem' : '1.5rem', scrollMarginTop: '90px' }}
                  >
                    {/* Section Header (Accordion) */}
                    <motion.div 
                      whileHover="hover"
                      onClick={() => toggleCategory(cat.slug)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '1.25rem', 
                        marginBottom: isExpanded ? '1.5rem' : '0.5rem', 
                        paddingBottom: '1rem', 
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: `linear-gradient(135deg, ${theme.bgGlow}, rgba(255,255,255,0.01))`, 
                          border: `1px solid ${theme.borderHover}`, 
                          color: theme.color, 
                          flexShrink: 0,
                          backdropFilter: 'blur(8px)',
                          boxShadow: `0 4px 12px rgba(${rgb}, 0.12)`,
                          transition: 'all 0.3s ease'
                        }}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem', color: theme.color }}>
                            {cat.name}
                          </div>
                          <h2 className="font-syne" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)', margin: 0 }}>
                            {cat.name === 'Emergency' ? 'Emergency Response' : `${cat.name} & Support`}
                          </h2>
                        </div>
                      </div>
                      <div style={{ 
                        color: theme.color, 
                        fontSize: '0.9rem', 
                        transition: 'transform 0.2s', 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        marginRight: '0.5rem'
                      }}>
                        ▼
                      </div>
                    </motion.div>

                    {isExpanded && (
                      <div style={{ paddingLeft: '0.25rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '560px', margin: '0 0 0.5rem 0' }}>
                            {cat.name === 'Laptop Services' && 'All brands covered — Dell, HP, Lenovo, ASUS, Acer, Samsung and more. OEM-quality parts.'}
                            {cat.name === 'Desktop / PC' && 'Home desktop and gaming PC repair, custom builds, upgrades and software configs.'}
                            {cat.name === 'Software & OS' && 'Clean Windows installations, driver setup, speed optimization and email configuration.'}
                            {cat.name === 'Virus & Security' && 'Complete malware cleanup, parental controls, VPN private configuration and account security.'}
                            {cat.name === 'Data & Recovery' && 'Recover lost files from failed, formatted or damaged drives. Set up backups.'}
                            {cat.name === 'Home Network' && 'Eliminate WiFi dead zones, setup smart home doorbells, and configure NAS servers.'}
                            {cat.name === 'Remote Support' && 'Connect instantly via secure screen share. Fast software troubleshooting.'}
                            {cat.name === 'New Device Setup' && 'Unbox, activate and transfer data to your new laptops, PCs, phones and smart TVs.'}
                            {cat.name === 'Apple / Mac' && 'Specialist repairs for MacBook Air/Pro, iMac, macOS restore and iPhone screen replacements.'}
                            {cat.name === 'Emergency' && 'Same-day dispatches, weekends and bank holiday visits for business and home urgencies.'}
                          </p>
                          <Link
                            href={`/services/${cat.slug}`}
                            style={{ display: 'inline-block', fontSize: '0.78rem', color: theme.color, textDecoration: 'none', fontWeight: 600 }}
                          >
                            View all {cat.name} services →
                          </Link>
                        </div>

                        {/* Services Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                          {cat.services.map(svc => {
                            const duration = getServiceDurationText(svc)
                            return (
                              <div
                                key={svc.slug}
                                className="spotlight-card"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={e => {
                                  e.currentTarget.style.borderColor = theme.color
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.borderColor = 'var(--border)'
                                }}
                                style={{
                                  background: `radial-gradient(circle 140px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${rgb}, 0.12), transparent 85%), var(--surface)`,
                                }}
                              >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
                              <h3 className="font-syne" style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)', flex: 1 }}>
                                {svc.name}
                              </h3>
                              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', background: theme.pillBg, color: theme.color, whiteSpace: 'nowrap' }}>
                                {duration}
                              </span>
                            </div>
                            {(() => {
                              const isServiceExpanded = expandedServices.includes(svc.slug)
                              const descriptionText = svc.description || ''
                              const hasLongDescription = descriptionText.length > 90
                              const displayDesc = !hasLongDescription || isServiceExpanded
                                ? descriptionText
                                : `${descriptionText.substring(0, 90)}...`
                              
                              return (
                                <div style={{ marginBottom: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                                    {displayDesc}
                                  </p>
                                  {hasLongDescription && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        toggleService(svc.slug)
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: theme.color,
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: '4px 0 0 0',
                                        alignSelf: 'flex-start',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                    >
                                      {isServiceExpanded ? 'Show Less ↑' : 'Read More ↓'}
                                    </button>
                                  )}
                                </div>
                              )
                            })()}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.85rem', fontWeight: 700, color: theme.color }}>
                                {svc.basePriceMin === svc.basePriceMax ? `£${svc.basePriceMin}` : `From £${svc.basePriceMin}`}
                              </span>
                              <Link
                                href={`/book?service=${svc.slug}&cat=${cat.slug}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.4rem 0.9rem',
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
                                Book →
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    </div>
                  )}
                </section>
              )
            })
          )}



            {/* Standard Fees & Surcharges */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem', marginTop: '4rem', marginBottom: '1.5rem' }}>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                Standard Fees &amp; Surcharges
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Coins size={20} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Flat Booking Deposit</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      Standard bookings in our coverage areas require a booking deposit (£10.00 for Zone 4 - fully credited towards final bill, or £15.00 for Zone 3) to secure your slot.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <ShieldCheck size={20} style={{ color: '#22C55E', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>No Fix, No Fee Guarantee</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      If we diagnostically confirm the device is unfixable, the repair is free. Emergency booking call-out fees are exempt once dispatch has occurred.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <HelpCircle size={20} style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 className="font-syne" style={{ color: '#F59E0B', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>TfL Congestion Zone</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      A <strong>£15.00</strong> congestion zone fee applies only if the booking address falls inside central London zones during charging hours (Mon-Fri, 7am-6pm). ULEZ is 100% free.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Trust Highlights (At bottom of page, above CTA banner) */}
            <div className="grid grid-cols-2 gap-2 md:hidden" style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
              {/* Highlight 1 */}
              <div style={{ background: 'rgba(18, 18, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.1)', color: '#00D2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.1rem' }}>50+ Services</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.25 }}>Complete support</p>
                </div>
              </div>
              {/* Highlight 2 */}
              <div style={{ background: 'rgba(18, 18, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.1rem' }}>DBS-Checked</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.25 }}>Certified engineers</p>
                </div>
              </div>
              {/* Highlight 3 */}
              <div style={{ background: 'rgba(18, 18, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={16} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.1rem' }}>Transparent</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.25 }}>Clear price bounds</p>
                </div>
              </div>
              {/* Highlight 4 */}
              <div style={{ background: 'rgba(18, 18, 18, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartHandshake size={16} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.1rem' }}>No Fix No Fee</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.25 }}>Risk-free guarantee</p>
                </div>
              </div>
            </div>

            {/* CTA BANNER */}
            {hasResults && (
              <div style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, rgba(0,153,187,0.03) 100%)', border: '1px solid rgba(0,210,255,0.15)', borderRadius: '16px', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', marginTop: '4rem' }}>
                <div>
                  <h3 className="font-syne" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Not sure which service you need?</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '480px' }}>
                    Get a certified DBS-checked engineer dispatched to your home or office. Describe your fault, and let us handle the rest.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    href={activeSection ? `/book?cat=${activeSection}` : activeFilter !== 'all' ? `/book?cat=${activeFilter}` : '/book'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.75rem 1.75rem',
                      background: '#00D2FF',
                      color: '#000000',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.background = '#0099BB'
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.background = '#00D2FF'
                      el.style.transform = 'none'
                    }}
                  >
                    Book a Technician
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Dropdown Card Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.27)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                zIndex: 9999,
              }}
            />

            {/* Floating Glass Card (like the hamburger menu) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="mobile-menu-card"
              style={{
                position: 'fixed',
                top: '12vh',
                left: '16px',
                right: '16px',
                margin: '0 auto',
                width: '300px',
                maxWidth: 'calc(100vw - 32px)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                maxHeight: '75vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="font-syne" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Select Category</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.25rem', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  onClick={() => { handleFilterClick('all'); setIsMobileFilterOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.85rem',
                    borderRadius: '8px', border: 'none',
                    background: activeFilter === 'all' ? 'rgba(0,210,255,0.08)' : 'transparent',
                    color: activeFilter === 'all' ? '#00D2FF' : 'var(--text-primary)',
                    fontSize: '0.95rem', fontWeight: activeFilter === 'all' ? 700 : 500,
                    textAlign: 'left', width: '100%', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Grid size={16} />
                  All Services
                </button>
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.slug] || Laptop
                  const isActive = activeFilter === cat.slug
                  const theme = THEME_MAP[cat.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)' }
                  return (
                    <motion.button
                      whileHover="hover"
                      key={cat.slug}
                      onClick={() => { handleFilterClick(cat.slug); setIsMobileFilterOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.85rem',
                        borderRadius: '8px', border: 'none',
                        background: isActive ? theme.bgGlow : 'transparent',
                        color: isActive ? theme.color : 'var(--text-primary)',
                        fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
                        textAlign: 'left', width: '100%', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ color: theme.color, display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>
                        <Icon size={18} />
                      </span>
                      {cat.name}
                    </motion.button>
                  )
                })}
              </div>

              {/* Mobile Bottom Sheet Trust Badges */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Guarantees
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Layers size={14} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }}>50+ Services</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.3 }}>Complete hardware &amp; software support</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <ShieldCheck size={14} style={{ color: '#22C55E', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }}>DBS-Checked</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.3 }}>Fully vetted home technicians</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Coins size={14} style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }}>Transparent Pricing</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.3 }}>Clear price bounds before booking</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <HeartHandshake size={14} style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }}>No Fix, No Fee</h5>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', lineHeight: 1.3 }}>Risk-free diagnostics guarantee</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Right-Side Vertical Progress Indicator (Desktop & Mobile) */}
      <div 
        className="flex flex-col items-center" 
        style={{ 
          position: 'fixed', 
          right: '8px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          zIndex: 99, 
          gap: '12px',
          background: 'rgba(10, 10, 12, 0.55)',
          backdropFilter: 'blur(12px)',
          padding: '12px 6px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Track Line */}
        <div style={{ position: 'absolute', top: '16px', bottom: '16px', width: '2px', background: 'rgba(255, 255, 255, 0.08)', zIndex: -1 }} />
        
        {categories.map(cat => {
          const theme = THEME_MAP[cat.slug] || { color: '#00D2FF' }
          const isActive = activeSection === cat.slug
          const isHovered = hoveredCategory === cat.slug
          const isVisible = isActive || isHovered
          
          return (
            <div 
              key={cat.slug} 
              onClick={() => scrollTo(cat.slug)}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative',
                cursor: 'pointer',
                height: '14px',
                width: '14px'
              }}
            >
              {/* Category Name Label (shown when active or hovered) */}
              <span style={{
                position: 'absolute',
                right: '24px',
                fontSize: '0.62rem',
                color: theme.color,
                background: 'rgba(10, 10, 12, 0.9)',
                border: `1px solid ${theme.color}22`,
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(8px)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none',
                fontFamily: 'var(--font-jetbrains)',
                fontWeight: 600
              }}>
                {cat.name}
              </span>
              
              {/* Indicator Dot */}
              <div 
                style={{
                  width: isVisible ? '8px' : '4px',
                  height: isVisible ? '8px' : '4px',
                  borderRadius: '50%',
                  background: isVisible ? theme.color : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: isVisible ? `0 0 10px ${theme.color}` : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
