'use client'

import { motion } from 'framer-motion'

interface IconProps {
  color?: string
  size?: number
}

// 1. Laptop Services
export function AnimatedLaptop({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <motion.rect
        x="3" y="4" width="18" height="12" rx="2" ry="2"
        style={{ originX: '12px', originY: '16px' }}
        variants={{
          hover: { scaleY: [1, 0.75, 1], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }
        }}
      />
      <path d="M2 20h20" />
      <path d="M5 16l-2 4h18l-2-4" />
    </svg>
  )
}

// 2. Desktop PC
export function AnimatedPcCase({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M15 6h.01" />
      <path d="M15 10h.01" />
      <motion.g
        variants={{
          hover: { rotate: 360, transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } }
        }}
        style={{ originX: '12px', originY: '15px' }}
      >
        <circle cx="12" cy="15" r="3" />
        <line x1="12" y1="12" x2="12" y2="18" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </motion.g>
    </svg>
  )
}

// 3. Software OS
export function AnimatedTerminal({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <motion.line
        x1="12" y1="19" x2="20" y2="19"
        variants={{
          hover: { opacity: [1, 0, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
        }}
      />
    </svg>
  )
}

// 4. Virus Security (Shield with radar pulse)
export function AnimatedShield({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="1.5"
        initial={{ scale: 0.6, opacity: 0 }}
        variants={{
          hover: {
            scale: [0.6, 1.7],
            opacity: [0.7, 0],
            transition: { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
          }
        }}
        style={{ originX: '12px', originY: '12px' }}
      />
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// 5. Data Recovery
export function AnimatedDatabase({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      <motion.path
        d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3"
        variants={{
          hover: { y: [0, 2, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
        }}
      />
    </svg>
  )
}

// 6. Home Network (Router with transmitting waves)
export function AnimatedRouter({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <rect x="2" y="14" width="20" height="6" rx="2" />
      <path d="M6 14V8" />
      <path d="M18 14V8" />
      <path d="M10 17h.01" />
      <path d="M14 17h.01" />
      <motion.path
        d="M2 5a5 5 0 0 1 8 0"
        variants={{
          hover: { opacity: [0.2, 1, 0.2], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0 } }
        }}
      />
      <motion.path
        d="M14 5a5 5 0 0 1 8 0"
        variants={{
          hover: { opacity: [0.2, 1, 0.2], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }
        }}
      />
    </svg>
  )
}

// 6b. Wi-Fi (Signal lines turning on/off in turn and expanding outward)
export function AnimatedWifi({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <circle cx="12" cy="18" r="1.5" fill={color} />
      <motion.path
        d="M8.5 14.5a5 5 0 0 1 7 0"
        variants={{
          hover: {
            opacity: [0.3, 1, 0.3],
            scale: [0.95, 1.05, 0.95],
            transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }
          }
        }}
        style={{ originX: '12px', originY: '18px' }}
      />
      <motion.path
        d="M5 11a10 10 0 0 1 14 0"
        variants={{
          hover: {
            opacity: [0.3, 1, 0.3],
            scale: [0.95, 1.05, 0.95],
            transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
          }
        }}
        style={{ originX: '12px', originY: '18px' }}
      />
      <motion.path
        d="M1.5 7.5a15 15 0 0 1 21 0"
        variants={{
          hover: {
            opacity: [0.3, 1, 0.3],
            scale: [0.95, 1.05, 0.95],
            transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
          }
        }}
        style={{ originX: '12px', originY: '18px' }}
      />
    </svg>
  )
}

// 7. Remote Support
export function AnimatedHeadset({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      <motion.path
        d="M20 17.6c-2 1.4-4.5 2.4-7 2.4"
        style={{ originX: '20px', originY: '17px' }}
        variants={{
          hover: { rotate: [0, 8, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }
        }}
      />
    </svg>
  )
}

// 8. New Device Setup
export function AnimatedSparkles({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <motion.g
        variants={{
          hover: { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0], transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }
        }}
        style={{ originX: '12px', originY: '12px' }}
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </motion.g>
    </svg>
  )
}

// 9. Apple / Mac
export function AnimatedApple({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <motion.g
        variants={{
          hover: { scale: [1, 1.15, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
        }}
        style={{ originX: '12px', originY: '14px' }}
      >
        <path d="M12 20.94c-1.54.24-3.05-.18-4.58-.84-2-1.37-3-3.14-3-5.67 0-4.25 2.75-6.5 5.5-6.5 1.5 0 2.5.5 3 1 .5-.5 1.5-1 3-1 2.75 0 5.5 2.25 5.5 6.5 0 2.53-1 4.3-3 5.67-1.53.66-3.04 1.08-4.58.84z" />
        <path d="M12 4c.5-1 1.5-2 3-2.5" />
      </motion.g>
    </svg>
  )
}

// 10. Emergency (Siren flashing)
export function AnimatedSiren({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <path d="M19 12a7 7 0 0 0-14 0v10h14V12z" />
      <path d="M5 22h14" />
      <motion.g
        variants={{
          hover: { 
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5],
            transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
          }
        }}
        style={{ originX: '12px', originY: '5px' }}
      >
        <path d="M12 2v3" stroke="#EF4444" strokeWidth="2.5" />
        <path d="M19.4 4.6l-2.1 2.1" stroke="#EF4444" strokeWidth="2.5" />
        <path d="M4.6 4.6l2.1 2.1" stroke="#EF4444" strokeWidth="2.5" />
      </motion.g>
    </svg>
  )
}

// 10b. Emergency - Lightning / Thunder (Zap with neon blinking effect and slight scale-up)
export function AnimatedZap({ color = 'currentColor', size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
      <motion.polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        variants={{
          hover: {
            scale: 1.15,
            stroke: [color, '#FF3366', color],
            fill: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.25)', 'rgba(239, 68, 68, 0)'],
            filter: [
              `drop-shadow(0 0 1px ${color})`,
              `drop-shadow(0 0 6px ${color})`,
              `drop-shadow(0 0 1px ${color})`
            ],
            transition: {
              scale: { duration: 0.3 },
              stroke: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
              fill: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
              filter: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
            }
          }
        }}
        style={{ originX: '12px', originY: '12px' }}
      />
    </svg>
  )
}
