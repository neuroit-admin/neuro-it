// =============================================================================
// Neuro IT — CinematicHero (Production Scroll Sequence)
// Fixes vs original:
//  1. AUTO-PLAY on mobile — no "ENTER" click required
//  2. prefers-reduced-motion: shows static hero + CTA instead of animation
//  3. Progressive frame loading — first 30 frames only, rest on scroll demand
//  4. Static fallback rendered in SSR (no canvas flash)
//  5. Removed inline hex colours → CSS variables
// =============================================================================
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link                                          from 'next/link'
import { motion }                                   from 'framer-motion'
import { useCinematicScroll, getChapterOpacity }    from '@/hooks/useCinematicScroll'

const MotionLink = motion(Link)

const TOTAL_FRAMES  = 230
const PRELOAD_COUNT = 30

const CHAPTERS = [
  { heading: 'Neuro IT',      subtitle: "London's Smartest IT Support"          },
  { heading: 'At Your Door',  subtitle: 'Same-day home visits across London'    },
  { heading: 'Fixed Fast',    subtitle: 'Certified technicians, no fix no fee'},
  { heading: 'Book in 60s',   subtitle: 'AI-powered booking, no long forms'     },
]

// ── Static fallback shown when prefers-reduced-motion is set ──────────────────
function StaticHero() {
  return (
    <section
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem', background: 'var(--bg-color)' }}
      aria-label="Neuro IT hero"
    >
      <h1 className="font-syne" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.05, marginBottom: '1.5rem' }}>
        Neuro <span style={{ color: 'var(--accent)' }}>IT</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', maxWidth: '560px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
        London&apos;s smartest home IT support. Certified technicians at your door — same day.
      </p>
      <Link href="/book" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'var(--accent)', color: 'var(--bg-color)', textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', borderRadius: '99px', fontSize: '1rem', letterSpacing: '0.04em' }}>
        Book a Technician →
      </Link>
    </section>
  )
}

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const framesRef    = useRef<(HTMLImageElement | null)[]>(Array(TOTAL_FRAMES).fill(null))
  const ctaRef       = useRef<HTMLAnchorElement>(null)

  const [isReady,         setIsReady]         = useState(false)
  const [isMobile,        setIsMobile]        = useState(false)
  const [scrollProgress,  setScrollProgress]  = useState(0)
  const [reducedMotion,   setReducedMotion]   = useState(false)
  const [mousePos,        setMousePos]        = useState({ x: 0, y: 0 })
  const [btnOffset,       setBtnOffset]       = useState({ x: 0, y: 0 })

  // Detect reduced motion and mobile on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handleMotionChange)

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })

    return () => {
      mq.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Parallax & Magnetism
  useEffect(() => {
    if (!isReady || reducedMotion) return
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      // 1. Text Parallax coordinates
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      setMousePos({ x, y })

      // 2. Button Magnetism
      const btn = ctaRef.current
      if (btn) {
        const rect = btn.getBoundingClientRect()
        const btnX = rect.left + rect.width / 2
        const btnY = rect.top + rect.height / 2
        const dist = Math.sqrt(Math.pow(e.clientX - btnX, 2) + Math.pow(e.clientY - btnY, 2))
        if (dist < 100) {
          setBtnOffset({
            x: (e.clientX - btnX) * 0.45,
            y: (e.clientY - btnY) * 0.45
          })
        } else {
          setBtnOffset({ x: 0, y: 0 })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMoveGlobal, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMoveGlobal)
  }, [isReady, reducedMotion])

  const framePath = useCallback((index: number) => {
    const padded = String(index + 1).padStart(3, '0')
    return isMobile ? `/video/frames-mobile/f_${padded}.webp` : `/video/frames/f_${padded}.webp`
  }, [isMobile])

  // Load first 30 frames → mark ready → auto-start (no click on mobile)
  useEffect(() => {
    if (reducedMotion) return
    let loaded = 0
    const onLoad = () => {
      loaded++
      if (loaded >= PRELOAD_COUNT) setIsReady(true)
    }
    for (let i = 0; i < PRELOAD_COUNT; i++) {
      const img = new Image()
      img.src     = framePath(i)
      img.onload  = onLoad
      img.onerror = onLoad
      framesRef.current[i] = img
    }
  }, [framePath, reducedMotion])

  // Load remaining frames lazily as scroll progresses
  const loadedUpTo = useRef(PRELOAD_COUNT - 1)
  useEffect(() => {
    if (!isReady) return
    // Load next batch when scroll > 20% milestones
    const BATCH = 50
    const needed = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollProgress * TOTAL_FRAMES) + BATCH)
    if (needed <= loadedUpTo.current) return
    for (let i = loadedUpTo.current + 1; i <= needed; i++) {
      if (framesRef.current[i]) continue
      const img = new Image()
      img.src = framePath(i)
      img.onload = () => { framesRef.current[i] = img }
      framesRef.current[i] = img
    }
    loadedUpTo.current = needed
  }, [scrollProgress, isReady, framePath])

  // Track scroll progress for chapter opacity
  useEffect(() => {
    if (!isReady) return
    const handleScroll = () => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const dist = rect.height - window.innerHeight
      if (dist <= 0) return
      setScrollProgress(Math.max(0, Math.min(1, -rect.top / dist)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isReady])

  useCinematicScroll(canvasRef, containerRef, framesRef.current, isMobile, isReady)

  const chapterOpacities = getChapterOpacity(scrollProgress)

  if (reducedMotion) return <StaticHero />

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }} aria-label="Neuro IT cinematic hero">
      {/* Sticky canvas viewport */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Loading skeleton — shown until frames ready */}
        {!isReady && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            aria-live="polite"
            aria-label="Loading hero"
          >
            <div className="font-syne" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', opacity: 0.9 }}>
              NEURO<span style={{ color: 'var(--accent)' }}>IT</span>
            </div>
            <div style={{ width: '120px', height: '2px', background: 'var(--surface-secondary)', borderRadius: '1px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', width: '40%', animation: 'pulse 1.2s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', opacity: isReady ? 1 : 0, transition: 'opacity 0.6s ease' }}
          aria-hidden="true"
        />

        {/* Chapter overlays */}
        {isReady && CHAPTERS.map((ch, i) => (
          <div
            key={i}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', opacity: chapterOpacities[i], transition: 'opacity 0.1s linear', pointerEvents: chapterOpacities[i] > 0.5 ? 'auto' : 'none' }}
            aria-hidden={chapterOpacities[i] < 0.5}
          >
            <h1 
              className="font-syne" 
              style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 6rem)', 
                fontWeight: 800, 
                color: '#FFFFFF', 
                textShadow: '0 2px 40px rgba(0,0,0,0.8)', 
                lineHeight: 1.05, 
                marginBottom: '1rem',
                transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {i === 0
                ? <><span>NEURO</span><span style={{ color: 'var(--accent)' }}>IT</span></>
                : ch.heading}
            </h1>
            <p 
              style={{ 
                color: 'rgba(224,224,224,0.85)', 
                fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', 
                maxWidth: '480px', 
                textShadow: '0 1px 20px rgba(0,0,0,0.8)', 
                lineHeight: 1.5,
                transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {ch.subtitle}
            </p>

            {/* CTA only on last chapter */}
            {i === CHAPTERS.length - 1 && (
              <MotionLink
                ref={ctaRef}
                href="/book"
                animate={{ x: btnOffset.x, y: btnOffset.y }}
                transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                style={{ 
                  marginTop: '2rem', 
                  display: 'inline-block', 
                  padding: '1rem 2.5rem', 
                  background: 'var(--accent)', 
                  color: 'var(--bg-color)', 
                  textDecoration: 'none', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-syne)', 
                  borderRadius: '99px', 
                  fontSize: '1.05rem', 
                  letterSpacing: '0.04em', 
                  boxShadow: '0 0 28px rgba(0,210,255,0.45)', 
                  transition: 'box-shadow 0.2s' 
                }}
                onMouseLeave={() => setBtnOffset({ x: 0, y: 0 })}
              >
                Book a Technician →
              </MotionLink>
            )}
          </div>
        ))}

        {/* Scroll cue — hidden after user starts scrolling */}
        {isReady && scrollProgress < 0.02 && (
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 1 - scrollProgress * 50, transition: 'opacity 0.3s' }} aria-hidden="true">
            <span style={{ color: 'rgba(136,136,136,0.7)', fontSize: '0.75rem', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}>SCROLL</span>
            <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(0,210,255,0.6), transparent)' }} />
          </div>
        )}
      </div>
    </div>
  )
}
