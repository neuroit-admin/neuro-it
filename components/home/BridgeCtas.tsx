'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface BridgeCtasProps {
  primaryCtaText: string
  whatsappCtaText: string
  whatsappNumber: string
}

function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    
    // Check distance from center of element
    const dist = Math.sqrt(x * x + y * y)
    
    if (dist < 100) {
      setPosition({ x: x * 0.45, y: y * 0.45 })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  )
}

export default function BridgeCtas({ primaryCtaText, whatsappCtaText, whatsappNumber }: BridgeCtasProps) {
  const [isWaHovered, setIsWaHovered] = useState(false)

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
      <Magnetic>
        <Link
          href="/book"
          id="home-primary-cta"
          className="glass-glow-btn"
        >
          {primaryCtaText}
        </Link>
      </Magnetic>

      <Magnetic>
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hi, I need IT support`}
          id="home-whatsapp-cta"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1rem 2.5rem',
            background: 'transparent',
            color: '#22C55E',
            textDecoration: 'none',
            fontWeight: 700,
            fontFamily: 'var(--font-syne)',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            borderRadius: '99px',
            border: '1px solid #22C55E',
            transition: 'box-shadow 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={e => {
            setIsWaHovered(true)
            e.currentTarget.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.3)'
            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'
          }}
          onMouseLeave={e => {
            setIsWaHovered(false)
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <motion.span
            animate={isWaHovered ? { rotate: [0, -15, 15, -15, 15, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-block', marginRight: '0.5rem' }}
          >
            💬
          </motion.span>
          {whatsappCtaText}
        </a>
      </Magnetic>
    </div>
  )
}
