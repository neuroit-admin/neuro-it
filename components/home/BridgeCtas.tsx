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
      className="w-full sm:w-auto text-center"
      style={{ display: 'inline-block' }}
    >
      {children}
    </motion.div>
  )
}

export default function BridgeCtas({ primaryCtaText, whatsappCtaText, whatsappNumber }: BridgeCtasProps) {
  const [isWaHovered, setIsWaHovered] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
      <Magnetic>
        <Link
          href="/book"
          id="home-primary-cta"
          className="glass-glow-btn w-full sm:w-auto"
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
          className="glass-glow-btn-whatsapp w-full sm:w-auto"
          onMouseEnter={() => setIsWaHovered(true)}
          onMouseLeave={() => setIsWaHovered(false)}
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
