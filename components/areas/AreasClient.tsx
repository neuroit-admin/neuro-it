'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Search, MapPin, Phone, ChevronRight } from 'lucide-react'
import type { MapNode } from './CoverageMap'

// Dynamically load the Leaflet Map component with SSR disabled
const CoverageMap = dynamic(() => import('./CoverageMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '450px',
      background: 'var(--bg-color)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      fontFamily: 'var(--font-jetbrains)',
      border: '1px solid var(--border)'
    }}>
      Loading interactive map engine...
    </div>
  )
})

const parseOutward = (code: string) => {
  const m = code.match(/^([A-Z]{1,2})(\d+)([A-Z]?)$/i)
  if (!m) return null
  return {
    area: m[1].toUpperCase(),
    district: parseInt(m[2], 10),
    subdistrict: m[3] ? m[3].toUpperCase() : ''
  }
}

const matchPostcodeOutward = (outward: string, prefix: string): boolean => {
  const outParsed = parseOutward(outward)
  const prefParsed = parseOutward(prefix)
  if (!outParsed || !prefParsed) return false
  return (
    outParsed.area === prefParsed.area &&
    outParsed.district === prefParsed.district &&
    (prefParsed.subdistrict === '' || outParsed.subdistrict === prefParsed.subdistrict)
  )
}

export default function AreasClient() {
  const [boroughs, setBoroughs] = useState<MapNode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [postcodeCheck, setPostcodeCheck] = useState('')
  const [postcodeStatus, setPostcodeStatus] = useState<'IDLE' | 'FREE' | 'STANDARD_999' | 'FLEX' | 'NATIONWIDE' | 'INVALID'>('IDLE')
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'>('ALL')
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null)
  const [activeLetter, setActiveLetter] = useState<string>('ALL')
  const [selectedBorough, setSelectedBorough] = useState<MapNode | null>(null)
  
  const mapSectionRef = useRef<HTMLDivElement>(null)

  // Reset active letter if user searches
  useEffect(() => {
    if (searchTerm) {
      setActiveLetter('ALL')
    }
  }, [searchTerm])

  // Fetch coverage boroughs from the database on mount
  useEffect(() => {
    fetch('/api/coverage')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBoroughs(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch coverage areas:', err)
        setLoading(false)
      })
  }, [])

  const handlePostcodeCheck = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = postcodeCheck.toUpperCase().replace(/\s+/g, '')
    if (!clean) {
      setPostcodeStatus('IDLE')
      setHighlightedNodeId(null)
      return
    }

    const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
    const cleanWithSpace = postcodeCheck.trim()
    if (clean.length < 3 || (!ukPostcodeRegex.test(cleanWithSpace) && clean.length >= 5)) {
      if (clean.length >= 5) {
        setPostcodeStatus('INVALID')
        setHighlightedNodeId(null)
        return
      }
    }

    let outward = clean
    if (clean.length >= 5) {
      outward = clean.slice(0, clean.length - 3)
    }

    const outwardUpper = outward.toUpperCase()

    // Match node
    let matchedNode = boroughs.find(b => 
      b.postcodes.some(pc => {
        const cleanPrefix = pc.trim().toUpperCase()
        return cleanPrefix && matchPostcodeOutward(outwardUpper, cleanPrefix)
      })
    )

    // Fallbacks
    if (!matchedNode) {
      const parsed = parseOutward(outwardUpper)
      if (parsed) {
        if (parsed.area === 'WD') matchedNode = boroughs.find(b => b.id === 'watford')
        else if (parsed.area === 'EN' && [1, 2, 3, 8].includes(parsed.district)) matchedNode = boroughs.find(b => b.id === 'enfield')
        else if (parsed.area === 'EN') matchedNode = boroughs.find(b => b.id === 'pottersbar')
        else if (parsed.area === 'HA' && [0, 9, 3].includes(parsed.district)) matchedNode = boroughs.find(b => b.id === 'wembley')
        else if (parsed.area === 'HA' || parsed.area === 'UB') matchedNode = boroughs.find(b => b.id === 'harrow')
        else if (parsed.area === 'N' && [1, 2, 3, 11, 12, 20].includes(parsed.district)) matchedNode = boroughs.find(b => b.id === 'barnet')
        else if (parsed.area === 'N') matchedNode = boroughs.find(b => b.id === 'islington')
        else if (parsed.area === 'NW') matchedNode = boroughs.find(b => b.id === 'camden')
        else if (parsed.area === 'E' && [15, 20].includes(parsed.district)) matchedNode = boroughs.find(b => b.id === 'stratford')
        else if (parsed.area === 'E') matchedNode = boroughs.find(b => b.id === 'hackney')
        else if (parsed.area === 'W' && [3, 5, 13].includes(parsed.district)) matchedNode = boroughs.find(b => b.id === 'ealing')
        else if (parsed.area === 'W' || parsed.area === 'EC' || parsed.area === 'WC') matchedNode = boroughs.find(b => b.id === 'westminster')
        else if (parsed.area === 'SE' || parsed.area === 'DA') matchedNode = boroughs.find(b => b.id === 'greenwich')
        else if (parsed.area === 'TW' || parsed.area === 'KT') matchedNode = boroughs.find(b => b.id === 'richmond')
        else if (parsed.area === 'CR' || parsed.area === 'SM' || parsed.area === 'BR') matchedNode = boroughs.find(b => b.id === 'croydon')
      }
    }

    if (matchedNode) {
      setHighlightedNodeId(matchedNode.id)
      setSelectedZone(matchedNode.zone as any)
      if (matchedNode.zone === 'FREE_CALL_OUT') {
        setPostcodeStatus('FREE')
      } else if (matchedNode.zone === 'STANDARD_999') {
        setPostcodeStatus('STANDARD_999')
      } else {
        setPostcodeStatus('FLEX')
      }
    } else {
      // It is nationwide UK, not in London or Watford
      setHighlightedNodeId(null)
      setPostcodeStatus('NATIONWIDE')
    }
  }

  // Handle map node click to update postcode input
  const handleMapNodeClick = (node: MapNode) => {
    setHighlightedNodeId(node.id)
    setPostcodeCheck(node.postcodes[0] || node.name)
    if (node.zone === 'FREE_CALL_OUT') {
      setPostcodeStatus('FREE')
    } else if (node.zone === 'STANDARD_999') {
      setPostcodeStatus('STANDARD_999')
    } else {
      setPostcodeStatus('FLEX')
    }
    setSelectedZone(node.zone as any)
  }

  // Filter boroughs
  const filteredBoroughs = boroughs.filter(borough => {
    const matchesSearch = borough.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPostcode = borough.postcodes.some(pc => pc.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesZone = selectedZone === 'ALL' || borough.zone === selectedZone
    return (matchesSearch || matchesPostcode) && matchesZone
  })

  // Auto-select first visible borough if current selection is not visible
  useEffect(() => {
    const filtered = boroughs.filter(borough => {
      const matchesSearch = borough.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPostcode = borough.postcodes.some(pc => pc.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesZone = selectedZone === 'ALL' || borough.zone === selectedZone
      return (matchesSearch || matchesPostcode) && matchesZone
    })
    
    const visible = filtered.filter(b => {
      if (activeLetter === 'ALL') return true
      return b.name.toUpperCase().startsWith(activeLetter)
    })
    
    if (visible.length > 0) {
      const isStillVisible = visible.some(b => b.id === selectedBorough?.id)
      if (!isStillVisible) {
        setSelectedBorough(visible[0])
      }
    } else {
      setSelectedBorough(null)
    }
  }, [searchTerm, selectedZone, activeLetter, boroughs, selectedBorough?.id])

  // Group boroughs by starting letter
  const groupedBoroughs: { [key: string]: MapNode[] } = {}
  filteredBoroughs.forEach(borough => {
    const firstLetter = borough.name.charAt(0).toUpperCase()
    if (!groupedBoroughs[firstLetter]) {
      groupedBoroughs[firstLetter] = []
    }
    groupedBoroughs[firstLetter].push(borough)
  })

  const letters = Object.keys(groupedBoroughs).sort()

  const handleBoroughLinkClick = (borough: MapNode) => {
    setHighlightedNodeId(borough.id)
    setPostcodeCheck(borough.postcodes[0])
    if (borough.zone === 'FREE_CALL_OUT') {
      setPostcodeStatus('FREE')
    } else if (borough.zone === 'STANDARD_999') {
      setPostcodeStatus('STANDARD_999')
    } else {
      setPostcodeStatus('FLEX')
    }
    setSelectedZone(borough.zone as any)
    
    // Scroll map into view
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (loading) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '3rem 0', textAlign: 'center', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
        Loading coverage records...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .directory-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        .directory-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2.5rem;
          align-items: stretch;
        }
        .borough-list-item {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          width: 100%;
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 6px;
          text-align: left;
          color: var(--text-primary);
        }
        .borough-list-item:hover {
          background: rgba(255, 255, 255, 0.02) !important;
          padding-left: 1.15rem !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          transition: all 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 210, 255, 0.25);
        }
        
        /* Light Theme Specific Styling overrides */
        [data-theme="light"] .directory-section {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.04) !important;
        }
        [data-theme="light"] .directory-grid-left-panel {
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%) !important;
          border: 1px solid rgba(226, 232, 240, 0.6) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02) !important;
        }
        [data-theme="light"] .directory-grid-right-panel {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(248, 250, 252, 0.6) 100%) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03) !important;
        }
        [data-theme="light"] .alphabet-btn {
          background: rgba(255, 255, 255, 0.6) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          color: var(--text-muted) !important;
        }
        [data-theme="light"] .alphabet-btn:hover {
          border-color: rgba(0, 210, 255, 0.5) !important;
          color: #0095B6 !important;
        }
        [data-theme="light"] .alphabet-btn-active {
          background: rgba(0, 210, 255, 0.06) !important;
          border: 1px solid #00D2FF !important;
          color: #0095B6 !important;
          box-shadow: 0 0 8px rgba(0, 210, 255, 0.1) !important;
        }
        [data-theme="light"] .borough-list-item {
          border-bottom: 1px solid rgba(226, 232, 240, 0.5) !important;
        }
        [data-theme="light"] .borough-list-item:hover {
          background: rgba(255, 255, 255, 0.7) !important;
          padding-left: 1.15rem !important;
        }
        [data-theme="light"] .borough-list-item-active {
          background: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02) !important;
        }
        [data-theme="light"] .borough-list-item-active .borough-name-span {
          color: #0095B6 !important;
        }
        [data-theme="light"] .detail-postcode-container {
          background: rgba(255, 255, 255, 0.5) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
        }
        [data-theme="light"] .detail-locate-btn {
          background: #FFFFFF !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
        }
        [data-theme="light"] .detail-locate-btn:hover {
          background: rgba(0, 210, 255, 0.04) !important;
          border-color: rgba(0, 210, 255, 0.3) !important;
        }
        [data-theme="light"] .directory-search-input {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          color: var(--text-primary) !important;
        }
        [data-theme="light"] .directory-search-input:focus {
          border-color: #00D2FF !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 10px rgba(0, 210, 255, 0.08) !important;
        }
        [data-theme="light"] .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .directory-section {
            padding: 1.25rem !important;
            border-radius: 12px !important;
          }
          .directory-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}} />
      
      {/* Dynamic Map and Search Controls Layout */}
      <section
        ref={mapSectionRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Form & Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Postcode Search Box */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} style={{ color: '#00D2FF' }} />
              Coverage Checker
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Check if we support your address. Enter the start of your UK postcode (e.g. EN5, N1 5AB).
            </p>

            <form onSubmit={handlePostcodeCheck} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="Enter postcode (e.g. N1, EN5)" 
                value={postcodeCheck}
                onChange={e => { setPostcodeCheck(e.target.value.toUpperCase()); setPostcodeStatus('IDLE') }}
                style={{
                  flex: 1,
                  background: 'var(--bg-color)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  letterSpacing: '0.05em',
                }}
              />
              <button 
                type="submit" 
                style={{
                  background: '#00D2FF',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-syne)',
                  transition: 'all 0.2s',
                }}
              >
                Check
              </button>
            </form>

            {/* Checker Status Alert */}
            {postcodeStatus === 'FREE' && (
              <div style={{ padding: '0.85rem', background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: '#00D2FF' }}>✓</span>
                <div>
                  <p style={{ color: '#00D2FF', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>Zone 4: Free Call-out Hub</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>مرکز اصلی عملیات ما با اعزام مهندسان مجرب به درب منزل شما بدون هزینه اعزام. رزرو نوبت حضوری با پرداخت بیعانه‌ای انجام می‌شود که به طور کامل از صورت‌حساب کسر می‌گردد به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).</p>
                </div>
              </div>
            )}
            {postcodeStatus === 'STANDARD_999' && (
              <div style={{ padding: '0.85rem', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: '#A855F7' }}>✓</span>
                <div>
                  <p style={{ color: '#A855F7', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>Zone 3: Standard Call-out Zone</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>بازدید و اعزام کارشناس به محل شما در همان روز. کلیه مراحل تعمیر بر اساس قانون بدون تعمیر، بدون هزینه انجام می‌شود و هزینه رفت‌وآمد ثابت است به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).</p>
                </div>
              </div>
            )}
            {postcodeStatus === 'FLEX' && (
              <div style={{ padding: '0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: '#F59E0B' }}>⚠️</span>
                <div>
                  <p style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>Zone 2: Greater London Flexible</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>پوشش سراسری سایر مناطق لندن بزرگ. اعزام کارشناس جهت عیب‌یابی در محل با پرداخت بیعانه پایه انجام می‌شود و مابقی هزینه رفت‌وآمد بر اساس مسافت دقیق محاسبه و اضافه خواهد شد به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).</p>
                </div>
              </div>
            )}
            {postcodeStatus === 'NATIONWIDE' && (
              <div style={{ padding: '0.85rem', background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: '#00D2FF' }}>✉️</span>
                <div>
                  <p style={{ color: '#00D2FF', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>Zone 1: Nationwide Mail-in Only</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>ارسال پستی سراسری برای تمام نقاط بریتانیا خارج از لندن بزرگ. لپ‌تاپ خود را مستقیماً به هاب مرکزی ما بفرستید. این سرویس شامل برچسب پستی پیش‌پرداخت رایگان و بیمه رویال میل تا سقف ۷۵۰.۰۰ پوند است با هزینه ۰.۰۰ پوند.</p>
                </div>
              </div>
            )}
            {postcodeStatus === 'INVALID' && (
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: '#EF4444' }}>✖</span>
                <div>
                  <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', margin: 0 }}>Invalid Postcode Format</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>Please check the spelling. Format should be like EN5, N1 5AB, etc.</p>
                </div>
              </div>
            )}
          </div>

          {/* Zones explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(0, 210, 255, 0.01)', border: '1px solid rgba(0, 210, 255, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 className="font-syne" style={{ color: '#00D2FF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D2FF', display: 'inline-block' }} />
                Zone 4: Free Call-out Hub
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                مرکز اصلی عملیات ما با اعزام مهندسان مجرب به درب منزل شما بدون هزینه اعزام. رزرو نوبت حضوری با پرداخت بیعانه‌ای انجام می‌شود که به طور کامل از صورت‌حساب کسر می‌گردد به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
              </p>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.01)', border: '1px solid rgba(168, 85, 247, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 className="font-syne" style={{ color: '#A855F7', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7', display: 'inline-block' }} />
                Zone 3: Standard Call-out
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                بازدید و اعزام کارشناس به محل شما در همان روز. کلیه مراحل تعمیر بر اساس قانون بدون تعمیر، بدون هزینه انجام می‌شود و هزینه رفت‌وآمد ثابت است به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
              </p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.01)', border: '1px solid rgba(245, 158, 11, 0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 className="font-syne" style={{ color: '#F59E0B', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                Zone 2: Greater London (Flexible Call-out)
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                پوشش سراسری سایر مناطق لندن بزرگ. اعزام کارشناس جهت عیب‌یابی در محل با پرداخت بیعانه پایه انجام می‌شود و مابقی هزینه رفت‌وآمد بر اساس مسافت دقیق محاسبه و اضافه خواهد شد به مبلغ ۱۵.۰۰ پوند. (گزینه ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✉️</span>
                Zone 1: Nationwide Mail-in Only
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                ارسال پستی سراسری برای تمام نقاط بریتانیا خارج از لندن بزرگ. لپ‌تاپ خود را مستقیماً به هاب مرکزی ما بفرستید. این سرویس شامل برچسب پستی پیش‌پرداخت رایگان و بیمه رویال میل تا سقف ۷۵۰.۰۰ پوند است با هزینه ۰.۰۰ پوند.
              </p>
            </div>
          </div>

          {/* Call-to-actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Link
              href="/book"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#00D2FF',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: '0.82rem',
                fontFamily: 'var(--font-syne)',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Book a Repair Now →
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447700000000'}?text=${encodeURIComponent("Hi, I want to check my address coverage. Postcode: ")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#25D366',
                fontWeight: 700,
                fontSize: '0.82rem',
                fontFamily: 'var(--font-syne)',
                borderRadius: '4px',
                border: '1px solid rgba(37, 211, 102, 0.4)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              💬 Ask on WhatsApp
            </a>
          </div>
        </div>

        {/* Right Column: OpenStreetMap and Zone Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Zone toggle buttons */}
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {(['ALL', 'FREE_CALL_OUT', 'STANDARD_999', 'LONDON_FLEX'] as const).map(zone => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => {
                    setSelectedZone(zone)
                    setHighlightedNodeId(null)
                  }}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: selectedZone === zone ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                    color: selectedZone === zone ? '#00D2FF' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {zone === 'ALL' ? 'Show All' : zone === 'FREE_CALL_OUT' ? 'Free Hub' : zone === 'STANDARD_999' ? 'Standard Zone' : 'Flexible Zone'}
                </button>
              ))}
            </div>

            {/* Mini Legend */}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains)' }}>
              Click nodes to view details
            </span>
          </div>

          {/* Leaflet Map Box Container */}
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
              background: 'var(--bg-color)',
              aspectRatio: '600 / 450',
              position: 'relative'
            }}
          >
            {/* Status Header Badge Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                color: selectedZone === 'FREE_CALL_OUT' ? '#00D2FF' : selectedZone === 'STANDARD_999' ? '#A855F7' : selectedZone === 'LONDON_FLEX' ? '#F59E0B' : '#00D2FF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                transition: 'color 0.3s',
                zIndex: 400, // Above leaflet containers
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: selectedZone === 'FREE_CALL_OUT' ? '#00D2FF' : selectedZone === 'STANDARD_999' ? '#A855F7' : selectedZone === 'LONDON_FLEX' ? '#F59E0B' : '#00D2FF',
                  display: 'inline-block',
                  animation: 'markerPulse 2s infinite',
                  transition: 'background-color 0.3s',
                }}
              />
              {selectedZone === 'FREE_CALL_OUT' ? 'Free Call-out Hub' : selectedZone === 'STANDARD_999' ? 'Standard Call-out' : selectedZone === 'LONDON_FLEX' ? 'Flexible Zone' : 'Interactive Coverage Map'}
            </div>

            <CoverageMap 
              boroughs={boroughs}
              highlightedNodeId={highlightedNodeId} 
              selectedZone={selectedZone} 
              onNodeClick={handleMapNodeClick} 
            />
          </div>
        </div>
      </section>

      {/* Borough Directory Grid */}
      <section className="directory-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>
              London Borough Directory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Browse or search London boroughs. Select a borough to view coverage details and locate it.
            </p>
          </div>

          {/* Directory Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Filter by name or postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="directory-search-input"
              style={{
                width: '100%',
                background: 'var(--bg-color)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <Search size={16} style={{ color: 'var(--text-muted)', position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        {filteredBoroughs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-jetbrains)' }}>
            No boroughs found matching your search criteria.
          </div>
        ) : (
          <div className="directory-grid">
            {/* Left Panel: Compact Directory List */}
            <div 
              className="directory-grid-left-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Alphabet Quick bar */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.85rem',
              }}>
                {['ALL', ...letters].map(l => {
                  const isLActive = activeLetter === l
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setActiveLetter(l)}
                      className={isLActive ? 'alphabet-btn alphabet-btn-active' : 'alphabet-btn'}
                      style={{
                        minWidth: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        background: isLActive ? 'rgba(0, 210, 255, 0.08)' : 'var(--surface)',
                        border: `1px solid ${isLActive ? '#00D2FF' : 'var(--border)'}`,
                        color: isLActive ? '#00D2FF' : 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-jetbrains)',
                        transition: 'all 0.2s',
                        boxShadow: isLActive ? '0 0 8px rgba(0, 210, 255, 0.15)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLActive) e.currentTarget.style.borderColor = 'var(--accent)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isLActive) e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>

              {/* Scrollable List container */}
              <div style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                paddingRight: '0.5rem',
              }}
              className="custom-scrollbar"
              >
                {filteredBoroughs
                  .filter(b => {
                    if (activeLetter === 'ALL') return true
                    return b.name.toUpperCase().startsWith(activeLetter)
                  })
                  .map(borough => (
                    <button
                      key={borough.id}
                      type="button"
                      onClick={() => {
                        setSelectedBorough(borough)
                        setHighlightedNodeId(borough.id)
                      }}
                      style={{
                        background: selectedBorough?.id === borough.id ? 'var(--surface)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderRadius: '6px',
                        textAlign: 'left',
                        flexShrink: 0,
                      }}
                      className={`borough-list-item ${selectedBorough?.id === borough.id ? 'borough-list-item-active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <div 
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: borough.zone === 'FREE_CALL_OUT' ? '#00D2FF' : borough.zone === 'STANDARD_999' ? '#A855F7' : '#F59E0B',
                            boxShadow: `0 0 6px ${borough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.4)' : borough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                            flexShrink: 0,
                          }} 
                        />
                        <span 
                          className="borough-name-span"
                          style={{ 
                            color: selectedBorough?.id === borough.id ? '#00D2FF' : 'var(--text-primary)', 
                            fontWeight: selectedBorough?.id === borough.id ? 700 : 500, 
                            fontSize: '0.85rem' 
                          }}
                        >
                          {borough.name}
                        </span>
                      </div>
                      <span style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--font-jetbrains)',
                      }}>
                        {borough.postcodes[0]}
                      </span>
                    </button>
                  ))
                }
              </div>
            </div>

            {/* Right Panel: Detailed View Card */}
            <div 
              className="directory-grid-right-panel"
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.75rem',
                backdropFilter: 'blur(8px)',
                minHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              {selectedBorough ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '1.5rem' }}>
                  {/* Header info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-jetbrains)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}>
                        Selected Borough
                      </span>
                      
                      {/* Zone Badge */}
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-syne)',
                        textTransform: 'uppercase',
                        background: selectedBorough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.1)' : selectedBorough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: selectedBorough.zone === 'FREE_CALL_OUT' ? '#00D2FF' : selectedBorough.zone === 'STANDARD_999' ? '#A855F7' : '#F59E0B',
                        border: `1px solid ${selectedBorough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.2)' : selectedBorough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                      }}>
                        {selectedBorough.zone === 'FREE_CALL_OUT' ? 'Free Call-out Hub' : selectedBorough.zone === 'STANDARD_999' ? 'Standard Zone' : 'Flexible Zone'}
                      </span>
                    </div>

                    <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                      {selectedBorough.name}
                    </h3>
                  </div>

                  {/* Postcode Coverage list */}
                  <div 
                    className="detail-postcode-container"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem' }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Covered Postcode Prefixes:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxHeight: '72px', overflowY: 'auto' }} className="custom-scrollbar">
                      {selectedBorough.postcodes.map(pc => (
                        <span key={pc} style={{
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.35rem',
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-jetbrains)',
                          color: 'var(--text-primary)',
                        }}>
                          {pc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Callout details based on zone */}
                  <div style={{ fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                    {selectedBorough.zone === 'FREE_CALL_OUT' && (
                      <p style={{ margin: 0 }}>
                        مرکز اصلی عملیات ما با اعزام مهندسان مجرب به درب منزل شما بدون هزینه اعزام. رزرو نوبت حضوری با پرداخت بیعانه‌ای انجام می‌شود که به طور کامل از صورت‌حساب کسر می‌گردد به مبلغ <strong style={{ color: '#00D2FF' }}>۱۵.۰۰ پوند</strong>. (ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
                      </p>
                    )}
                    {selectedBorough.zone === 'STANDARD_999' && (
                      <p style={{ margin: 0 }}>
                        بازدید و اعزام کارشناس به محل شما در همان روز. کلیه مراحل تعمیر بر اساس قانون بدون تعمیر، بدون هزینه انجام می‌شود و هزینه رفت‌وآمد ثابت است به مبلغ <strong style={{ color: '#A855F7' }}>۱۵.۰۰ پوند</strong>. (ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
                      </p>
                    )}
                    {selectedBorough.zone === 'LONDON_FLEX' && (
                      <p style={{ margin: 0 }}>
                        پوشش سراسری سایر مناطق لندن بزرگ. اعزام کارشناس جهت عیب‌یابی در محل با پرداخت بیعانه پایه انجام می‌شود و مابقی هزینه رفت‌وآمد بر اساس مسافت دقیق محاسبه و اضافه خواهد شد به مبلغ <strong style={{ color: '#F59E0B' }}>۱۵.۰۰ پوند</strong>. (ارسال پستی رایگان و تحویل حضوری نیز در دسترس است با هزینه ۰.۰۰ پوند).
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleBoroughLinkClick(selectedBorough)}
                      className="detail-locate-btn"
                      style={{
                        flex: 1,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '0.6rem 1rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-syne)',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <MapPin size={12} style={{ color: '#00D2FF' }} /> Locate
                    </button>

                    <Link
                      href="/book"
                      style={{
                        flex: 1.5,
                        background: selectedBorough.zone === 'FREE_CALL_OUT' ? '#00D2FF' : selectedBorough.zone === 'STANDARD_999' ? '#A855F7' : '#F59E0B',
                        color: '#0A0A0A',
                        borderRadius: '6px',
                        padding: '0.6rem 1rem',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-syne)',
                        transition: 'all 0.2s',
                        boxShadow: `0 4px 12px ${selectedBorough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.15)' : selectedBorough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Book Repair →
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)', textAlign: 'center', height: '100%', padding: '2rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px dashed var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface)',
                  }}>
                    <MapPin size={20} />
                  </div>
                  <p style={{ fontSize: '0.82rem', margin: 0, maxWidth: '240px', lineHeight: 1.4 }}>
                    Select a London borough from the directory to view precise service details and pricing zones.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
