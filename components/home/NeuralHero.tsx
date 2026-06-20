'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── Network Settings ─────────────────────────────────────────────────────────────
const NODE_COUNT   = 94   // Number of points - increased by 30%
const CONNECT_DIST = 140  // Max distance for drawing connection lines (px)
const MOUSE_PULL   = 100  // Mouse gravity radius (px)
const MOUSE_FORCE  = 0.016 // Gravity power (smaller number = gentler)
const FRICTION     = 0.984 // Movement friction (closer to 1 = slower)
const BASE_SPEED   = 0.28  // Base movement speed of nodes

interface Node {
  x: number; y: number
  vx: number; vy: number
  r: number             // Central point radius
  pulse: number         // Light pulse phase
  pulseSpeed: number    // Pulse speed
}

// ── Static Fallback ───────────────────────────────────────────────────────────
function StaticHero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem',
        background: '#050a0f',
      }}
      aria-label="Neuro IT — London's Premier IT Support"
    >
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', color: 'rgba(0,210,255,0.6)', textTransform: 'uppercase', marginBottom: '1.25rem', fontFamily: 'var(--font-jetbrains)' }}>
        London&apos;s Premier IT Support
      </p>
      <h1 className="font-syne" style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.08, marginBottom: '1rem' }}>
        Neuro<span style={{ color: 'var(--accent)' }}>IT</span>
        <br />Smarter Support.
      </h1>
      <p style={{ color: 'rgba(200,220,235,0.65)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: '480px', lineHeight: 1.65, marginBottom: '2.5rem' }}>
        Certified engineers at your door — same day, no fix no fee. Trusted across all 33 London boroughs.
      </p>
      <Link
        href="/book"
        style={{ display: 'inline-block', padding: '0.9rem 2.25rem', background: 'var(--accent)', color: '#050a0f', textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', borderRadius: '5px', fontSize: '1rem', letterSpacing: '0.04em' }}
      >
        Book a Technician →
      </Link>
    </section>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NeuralHero() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef  = useRef<Node[]>([])
  const mouseRef  = useRef({ x: -1000, y: -1000 })
  const rafRef    = useRef<number>(0)
  const glowRef   = useRef<HTMLDivElement>(null)

  // ── Node Generation ──────────────────────────────────────────────────────────────
  const initNodes = useCallback((W: number, H: number) => {
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * BASE_SPEED * 2,
      vy: (Math.random() - 0.5) * BASE_SPEED * 2,
      r:  1.5 + Math.random() * 2,
      pulse:      Math.random() * Math.PI * 2,
      pulseSpeed: 0.014 + Math.random() * 0.028,
    }))
  }, [])

  // ── Draw Loop ────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const nodes = nodesRef.current

    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]

      // Mouse gravity
      const dx = mx - n.x
      const dy = my - n.y
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < MOUSE_PULL && d > 0) {
        const f = (1 - d / MOUSE_PULL) * MOUSE_FORCE
        n.vx += (dx / d) * f
        n.vy += (dy / d) * f
      }

      // Friction and movement
      n.vx *= FRICTION
      n.vy *= FRICTION
      n.x  += n.vx
      n.y  += n.vy

      // Boundary collision
      if (n.x < 0)  { n.x = 0;  n.vx *= -1 }
      if (n.x > W)  { n.x = W;  n.vx *= -1 }
      if (n.y < 0)  { n.y = 0;  n.vy *= -1 }
      if (n.y > H)  { n.y = H;  n.vy *= -1 }

      // Drawing connection lines
      for (let j = i + 1; j < nodes.length; j++) {
        const m  = nodes[j]
        const ex = m.x - n.x
        const ey = m.y - n.y
        const ed = Math.sqrt(ex * ex + ey * ey)
        if (ed < CONNECT_DIST) {
          const baseAlpha = (1 - ed / CONNECT_DIST) * 0.35
          // Lines near the mouse glow brighter
          const midX = (n.x + m.x) / 2
          const midY = (n.y + m.y) / 2
          const md   = Math.sqrt((mx - midX) ** 2 + (my - midY) ** 2)
          const glow = md < 160 ? (1 - md / 160) * 0.4 : 0
          const alpha = Math.min(baseAlpha + glow, 0.72)

          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(m.x, m.y)
          ctx.strokeStyle = `rgba(0,210,255,${alpha})`
          ctx.lineWidth   = ed < 55 ? 0.9 : 0.45
          ctx.stroke()
        }
      }

      // Drawing node with glow
      n.pulse += n.pulseSpeed
      const pAlpha   = 0.5 + Math.sin(n.pulse) * 0.32
      const nearMouse = d < 130 ? (1 - d / 130) * 0.55 : 0
      const finalA   = Math.min(pAlpha + nearMouse, 1)

      // Glow aura around the node
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4)
      grd.addColorStop(0, `rgba(0,210,255,${finalA * 0.7})`)
      grd.addColorStop(1, 'rgba(0,210,255,0)')
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Central node point (brighter)
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(190,245,255,${finalA})`
      ctx.fill()
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // ── Initialisation ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Checking prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const resize = () => {
      canvas.width  = wrap.clientWidth
      canvas.height = wrap.clientHeight
      initNodes(canvas.width, canvas.height)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [draw, initNodes])

  // ── Mouse Events ───────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y }
    if (glowRef.current) {
      glowRef.current.style.left = `${x}px`
      glowRef.current.style.top  = `${y}px`
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Smooth return to center
    const canvas = canvasRef.current
    if (canvas) mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0'
      setTimeout(() => { if (glowRef.current) glowRef.current.style.opacity = '1' }, 300)
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (glowRef.current) glowRef.current.style.opacity = '1'
  }, [])

  // ── TouchMove for Mobile ───────────────────────────────────────────────────
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const t = e.touches[0]
    mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
  }, [])

  // ── Reduced Motion: Fallback ─────────────────────────────────────────────────
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return <StaticHero />
  }

  return (
    <section
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        overflow: 'hidden',
        background: '#050a0f',
        cursor: 'none',
      }}
      aria-label="Neuro IT — London's Premier Home IT Support"
    >
      {/* ── Neural Network Canvas ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* ── Mouse Glow ── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          transition: 'left 0.07s linear, top 0.07s linear',
          zIndex: 1,
        }}
      />

      {/* ── Main Content ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem 1.5rem',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* eyebrow */}
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            color: 'rgba(0,210,255,0.6)',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
            fontFamily: 'var(--font-jetbrains)',
          }}
        >
          London&apos;s Premier IT Support
        </p>

        {/* H1 */}
        <h1
          className="font-syne"
          style={{
            fontSize: 'clamp(2.8rem, 7.5vw, 5rem)',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.07,
            marginBottom: '1.1rem',
            textShadow: '0 2px 48px rgba(0,0,0,0.5)',
          }}
        >
          Neuro<span style={{ color: 'var(--accent)' }}>IT</span>
          <br />
          Smarter Support.
        </h1>

        {/* Subtitle */}
        <p
          className="hidden md:block"
          style={{
            color: 'rgba(200,220,235,0.65)',
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            maxWidth: '480px',
            lineHeight: 1.65,
            marginBottom: '2rem',
            textShadow: '0 1px 20px rgba(0,0,0,0.6)',
          }}
        >
          Certified engineers at your door — same day, no fix no fee.
          Trusted across all 33 London boroughs.
        </p>

        {/* Trust row */}
        <div
          className="hidden md:flex"
          style={{
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
          aria-label="Trust signals"
        >
          {['DBS Checked', 'Fully Insured', '4.9 ★ Google', 'Same-Day'].map((item) => (
            <span
              key={item}
              style={{
                fontSize: '0.7rem',
                color: 'rgba(0,210,255,0.72)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                letterSpacing: '0.06em',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#00D2FF',
                  boxShadow: '0 0 6px #00D2FF',
                  flexShrink: 0,
                }}
              />
              {item}
            </span>
          ))}
        </div>

        {/* CTA Button — pointer-events: all for clickability */}
        <Link
          href="/book"
          style={{ pointerEvents: 'all' }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.9rem 2.25rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'var(--font-syne)',
              letterSpacing: '0.04em',
              color: '#050a0f',
              background: 'var(--accent)',
              borderRadius: '5px',
              textDecoration: 'none',
              transition: 'transform 0.18s, box-shadow 0.18s',
              boxShadow: '0 0 24px rgba(0,210,255,0.35)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 36px rgba(0,210,255,0.5)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 0 24px rgba(0,210,255,0.35)'
            }}
          >
            Book a Technician
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>

      {/* ── Bottom Page Stats ── */}
      <div
        className="hidden md:flex"
        style={{
          position: 'absolute',
          bottom: '1.75rem',
          left: 0,
          right: 0,
          justifyContent: 'center',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
        aria-label="Key statistics"
      >
        {[
          { n: '150+', l: 'Reviews' },
          { n: '33',   l: 'Boroughs' },
          { n: '98%',  l: 'Fix Rate' },
          { n: '<2h',  l: 'Response' },
        ].map(({ n, l }) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-syne)', lineHeight: 1 }}>
              {n}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(200,220,235,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom gradient line for transition to next section ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to bottom, transparent, var(--bg-color))',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </section>
  )
}
