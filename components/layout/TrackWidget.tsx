'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import TrackForm from './TrackForm'

interface TrackWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export default function TrackWidget({ isOpen, onClose }: TrackWidgetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', maxWidth: '400px', width: '100%', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}
        >
          <X size={20} />
        </button>
        
        <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Track Your Repair</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>Enter your ticket reference code and email to track status.</p>
        
        <TrackForm variant="stacked" onSuccess={onClose} />
      </div>
    </div>,
    document.body
  )
}
