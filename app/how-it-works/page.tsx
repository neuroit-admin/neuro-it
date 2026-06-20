'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import Link from 'next/link'
import { 
  Calendar, MapPin, ShieldCheck, Wrench, 
  Lock, CheckCircle, Cpu, CreditCard, ChevronRight, Shield, Mail, Package, Store
} from 'lucide-react'
import { WARRANTY_TITLE, WARRANTY_TEXT } from '@/lib/constants/business'

export default function HowItWorksPage() {
  const [activeChannel, setActiveChannel] = useState<'HOME_VISIT' | 'MAIL_IN' | 'DROP_OFF'>('HOME_VISIT')
  const [activeStep, setActiveStep] = useState(0)
  const [openMobileSteps, setOpenMobileSteps] = useState<number[]>([0, 1, 2, 3])
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [logIndex, setLogIndex] = useState(0)

  const handleChannelChange = (channel: 'HOME_VISIT' | 'MAIL_IN' | 'DROP_OFF') => {
    setActiveChannel(channel)
    setActiveStep(0)
    setOpenMobileSteps([0, 1, 2, 3])
  }

  const homeVisitSteps = [
    {
      title: 'Online Booking',
      icon: Calendar,
      emoji: '🗓️',
      desc: 'Submit your issue and address. Book with a flat £15.00 deposit/travel fee (fully deducted from final invoice for Zone 4, flat travel fee for Zone 3, or base travel deposit for custom zones) to secure your slot.',
      color: '#00D2FF',
      shadow: 'rgba(0, 210, 255, 0.4)',
    },
    {
      title: 'Dispatch & Diagnosis',
      icon: MapPin,
      emoji: '📍',
      desc: 'A vetted, certified engineer is dispatched to your door. We perform on-site troubleshooting, identify the fault, and provide a transparent quote before any work starts.',
      color: '#A855F7',
      shadow: 'rgba(168, 85, 247, 0.4)',
    },
    {
      title: 'Precision Repair',
      icon: Wrench,
      emoji: '🔧',
      desc: 'Our technician isolates and repairs the hardware or software issue, cleans components, installs necessary upgrades, and verifies full system stability.',
      color: '#EC4899',
      shadow: 'rgba(236, 72, 153, 0.4)',
    },
    {
      title: 'Completion & Warranty',
      icon: ShieldCheck,
      emoji: '🛡️',
      desc: `Test your device to confirm absolute satisfaction. Pay the remaining balance securely on-site (card/bank transfer). Receive a VAT invoice and a ${WARRANTY_TEXT.toLowerCase()}.`,
      color: '#22C55E',
      shadow: 'rgba(34, 197, 94, 0.4)',
    },
  ]

  const mailInSteps = [
    {
      title: 'Register & Free Postage Label',
      icon: Mail,
      emoji: '✉️',
      desc: 'Select the Mail-in service, upload photos of your device, and checkout with £0 deposit. We instantly generate and email a prepaid Royal Mail Special Delivery shipping label to you.',
      color: '#00D2FF',
      shadow: 'rgba(0, 210, 255, 0.4)',
    },
    {
      title: 'Secure Packing & Posting',
      icon: Package,
      emoji: '📦',
      desc: 'Package your device securely (use bubble wrap), print and attach the prepaid label, and hand it over at any Royal Mail Post Office. Your device is insured for up to £750 in transit.',
      color: '#A855F7',
      shadow: 'rgba(168, 85, 247, 0.4)',
    },
    {
      title: 'Workshop Repair & Diagnostics',
      icon: Wrench,
      emoji: '🔬',
      desc: 'Once received, our senior workshop engineers unbox and photograph your device. We perform a complete diagnostic scan and send you a final, transparent repair quote.',
      color: '#EC4899',
      shadow: 'rgba(236, 72, 153, 0.4)',
    },
    {
      title: 'Secure Return & Warranty',
      icon: ShieldCheck,
      emoji: '🚚',
      desc: `Pay securely online after the repair is completed. We ship your device back via Royal Mail Special Delivery (fully insured) within 24 hours. Includes a ${WARRANTY_TEXT.toLowerCase()}.`,
      color: '#22C55E',
      shadow: 'rgba(34, 197, 94, 0.4)',
    },
  ]

  const dropOffSteps = [
    {
      title: 'Select Appointment Slot',
      icon: Calendar,
      emoji: '🕒',
      desc: 'Book your Drop-off repair online with £0 deposit. Select a convenient date and choice of time window (Morning, Afternoon, or Evening) to secure your queue priority.',
      color: '#00D2FF',
      shadow: 'rgba(0, 210, 255, 0.4)',
    },
    {
      title: 'Workshop Check-in',
      icon: Store,
      emoji: '🏢',
      desc: 'Bring your device to our central London workshop during your slot. Our front-desk team registers the device, runs a quick initial check-in, and issues a digital ticket receipt.',
      color: '#A855F7',
      shadow: 'rgba(168, 85, 247, 0.4)',
    },
    {
      title: 'Diagnostics & Bench Repair',
      icon: Wrench,
      emoji: '🛠️',
      desc: 'Our bench technicians diagnose the system, communicate the exact repair requirements and pricing, and proceed with precision hardware fixes or software restorations.',
      color: '#EC4899',
      shadow: 'rgba(236, 72, 153, 0.4)',
    },
    {
      title: 'In-Person Collection & Warranty',
      icon: ShieldCheck,
      emoji: '🛍️',
      desc: `Test your repaired device in-person at the workshop to confirm full satisfaction. Pay the balance securely via card or cash, collect your device, and receive a ${WARRANTY_TEXT.toLowerCase()}.`,
      color: '#22C55E',
      shadow: 'rgba(34, 197, 94, 0.4)',
    },
  ]

  const steps = activeChannel === 'HOME_VISIT' 
    ? homeVisitSteps 
    : activeChannel === 'MAIL_IN' 
    ? mailInSteps 
    : dropOffSteps

  const allLogs = [
    'Initializing hardware diagnostics...',
    'Scanning RAM modules... [OK]',
    'Reading CPU thermal sensors... Temp: 78°C (High)',
    'Isolating cooling fan circuit...',
    'Diagnosing fan bearings... [FAILURE]',
    'Cleaning internal dust particles...',
    'Replacing cooling fan assembly...',
    'Applying high-performance thermal compound...',
    'Verifying CPU temperatures... Temp: 42°C [STABLE]',
    'System diagnostic check... [PASS]',
    'Running software stress test... OK',
    'Repair completed successfully! 👍'
  ]

  useEffect(() => {
    if (activeStep !== 2) {
      setTerminalLogs([])
      setLogIndex(0)
      return
    }

    setTerminalLogs([allLogs[0]])
    setLogIndex(1)

    const interval = setInterval(() => {
      setLogIndex(prev => {
        if (prev >= allLogs.length) {
          clearInterval(interval)
          return prev
        }
        setTerminalLogs(logs => [...logs, allLogs[prev]])
        return prev + 1
      })
    }, 1200)

  return () => clearInterval(interval)
  }, [activeStep, activeChannel])

  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const firstStepEl = document.getElementById('how-it-works-step-0')
      const lastStepEl = document.getElementById(`how-it-works-step-${steps.length - 1}`)
      
      if (firstStepEl && lastStepEl) {
        const startY = firstStepEl.getBoundingClientRect().top + window.scrollY - 150
        const endY = lastStepEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight / 2
        const currentY = window.scrollY
        
        let progress = 0
        if (currentY >= startY) {
          if (currentY >= endY) {
            progress = 100
          } else {
            progress = ((currentY - startY) / (endY - startY)) * 100
          }
        }
        setScrollProgress(progress)
        
        const viewportCenter = window.scrollY + window.innerHeight / 2.5
        let currentStep = 0
        for (let i = 0; i < steps.length; i++) {
          const el = document.getElementById(`how-it-works-step-${i}`)
          if (el) {
            const top = el.offsetTop
            if (viewportCenter >= top - 20) {
              currentStep = i
            }
          }
        }
        setActiveStep(currentStep)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [steps])

  const renderBookingMockup = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(0, 210, 255, 0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 210, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D2FF' }} />
          <span style={{ fontSize: '0.75rem', color: '#00D2FF', fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>SECURE BOOKING</span>
        </div>
        <Lock size={12} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--surface-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Service Selected</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Laptop Screen Replacement</p>
        </div>
        <div style={{ background: 'var(--surface-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.75rem' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>Address</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>High Street, Barnet, EN5</p>
        </div>
      </div>
  
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>£99.00 - £120.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-primary)' }}>Flat Booking Deposit</span>
          <span style={{ color: '#00D2FF' }}>£15.00</span>
        </div>
        <p style={{ fontSize: '0.6rem', color: '#555', marginTop: '0.25rem', lineHeight: 1.3 }}>* Deducted from final invoice. Secured under UK GDPR protocol.</p>
      </div>
  
      <div style={{
        background: '#00D2FF',
        color: 'var(--bg-color)',
        padding: '0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 700,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}>
        <CreditCard size={14} /> Pay £15.00 Deposit Securely
      </div>
    </div>
  )

  const renderDispatchMockup = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(168, 85, 247, 0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(168, 85, 247, 0.05)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }} className="radar-ping" />
          <span style={{ fontSize: '0.75rem', color: '#A855F7', fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>LIVE DISPATCH</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ETA: 14 mins</span>
      </div>
  
      {/* Map Grid Simulator */}
      <div style={{
        height: '130px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1.25rem',
      }}>
        {/* Background streets */}
        <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: '90px', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: '60px', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: '200px', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: '300px', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.06)' }} />
  
        {/* Target House node */}
        <div style={{ position: 'absolute', left: '200px', top: '30px', transform: 'translate(-50%, -50%)', zIndex: 5 }}>
          <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '3px' }} />
          <div style={{ position: 'absolute', width: '24px', height: '24px', border: '2px solid #EF4444', borderRadius: '50%', left: '-6px', top: '-6px', animation: 'radarPulse 1.5s infinite' }} />
        </div>
  
        {/* Starting point node */}
        <div style={{ position: 'absolute', left: '60px', top: '90px', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '8px', height: '8px', background: '#A855F7', borderRadius: '50%' }} />
        </div>
  
        {/* Car pointer moving */}
        <div style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          background: '#A855F7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bg-color)',
          fontSize: '0.6rem',
          boxShadow: '0 0 10px #A855F7',
          animation: 'moveCar 6s infinite linear',
          zIndex: 10,
        }}>
          📍
        </div>
      </div>
  
      {/* Assigned Tech Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,85,247,0.3)' }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>David Miller</p>
          <p style={{ fontSize: '0.65rem', color: '#22C55E', fontWeight: 500, margin: 0 }}>✓ Security Vetted & DBS Clean</p>
        </div>
        <span style={{ fontSize: '0.6rem', color: '#A855F7', border: '1px solid #A855F7', borderRadius: '4px', padding: '0.15rem 0.35rem', fontWeight: 600 }}>DISPATCHED</span>
      </div>
    </div>
  )

  const renderRepairMockup = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(236, 72, 153, 0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(236, 72, 153, 0.05)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={14} style={{ color: '#EC4899', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: '#EC4899', fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>DIAGNOSTICS & REPAIR</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains)' }}>live_stream.sh</span>
      </div>
  
      {/* Terminal Emulator */}
      <div style={{
        height: '160px',
        background: 'var(--surface-secondary)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.04)',
        padding: '0.75rem',
        fontFamily: 'var(--font-jetbrains)',
        fontSize: '0.65rem',
        lineHeight: 1.5,
        color: '#A8A8A8',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
      }}>
        {terminalLogs.map((log, idx) => {
          let color = '#A8A8A8'
          if (log.includes('[OK]')) color = '#22C55E'
          if (log.includes('[FAILURE]')) color = '#EF4444'
          if (log.includes('successfully')) color = '#00D2FF'
          return (
            <div key={idx} style={{ color }}>
              <span style={{ color: '#EC4899', marginRight: '0.35rem' }}>$</span>
              {log}
            </div>
          )
        })}
        {terminalLogs.length < allLogs.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            <span style={{ color: '#EC4899', marginRight: '0.35rem' }}>$</span>
            <span style={{ width: '6px', height: '12px', background: '#EC4899', display: 'inline-block', animation: 'pulse 1s infinite' }} />
          </div>
        )}
      </div>
    </div>
  )

  const renderCompletionMockup = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(34, 197, 94, 0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(34, 197, 94, 0.05)',
      backdropFilter: 'blur(10px)',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22C55E',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <CheckCircle size={24} />
        </div>
      </div>
  
      <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
        Repair Fully Completed
      </h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
        Device tested, verified, and ready for pickup/handover.
      </p>
  
      {/* Warranty badge */}
      <div style={{
        border: '1px dashed rgba(34, 197, 94, 0.3)',
        background: 'rgba(34, 197, 94, 0.02)',
        borderRadius: '8px',
        padding: '0.85rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'left',
      }}>
        <Shield size={22} style={{ color: '#22C55E', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{WARRANTY_TITLE} Secured</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>Covers all replaced hardware components and workmanship.</p>
        </div>
      </div>
  
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{
          flex: 1,
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-primary)',
          background: 'var(--surface)',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          📄 View VAT Invoice
        </div>
        <div style={{
          flex: 1,
          background: '#22C55E',
          color: 'var(--bg-color)',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}>
          Done
        </div>
      </div>
    </div>
  )

  const renderMailInMockup = (stepIdx = activeStep) => {
    switch (stepIdx) {
      case 0:
        return (
          <div style={{
            background: '#FFFFFF',
            color: '#000000',
            borderRadius: '12px',
            padding: '1.25rem',
            fontFamily: 'sans-serif',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            border: '2px solid #D2143A'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#D2143A' }}>Royal Mail</span>
              <span style={{ fontWeight: 700, fontSize: '0.7rem', border: '1px solid #000', padding: '1px 4px' }}>SPECIAL DELIVERY</span>
            </div>
            <div style={{ fontSize: '0.65rem', marginBottom: '0.75rem', lineHeight: 1.3 }}>
              <strong>POSTAGE PAID</strong><br/>
              License Number: <strong>HQ-44021-LDN</strong><br/>
              Insurance: <strong>Up to £750 Included</strong>
            </div>
            
            <div style={{ background: '#F0F0F0', border: '1px solid #CCC', borderRadius: '4px', padding: '0.5rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block' }}>DELIVER TO:</span>
              <strong>Neuro IT Workshop Hub</strong><br/>
              Unit 14, Enterprise House, London, N12 0EH
            </div>

            <div style={{ background: '#000', height: '40px', width: '100%', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.45rem', fontFamily: 'monospace', letterSpacing: '2px' }}>|||||||||||||||||||||||||||||||||||||||</div>
            </div>
            <div style={{ fontSize: '0.6rem', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '1rem' }}>SD 9928 1021 4GB</div>

            <div style={{
              background: '#D2143A',
              color: 'var(--text-primary)',
              padding: '0.6rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}>
              🖨️ Download Postage Label (PDF)
            </div>
          </div>
        )
      case 1:
        return (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(168, 85, 247, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(168, 85, 247, 0.05)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#A855F7', fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>TRANSIT TRACKER</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ref: SD992810214GB</span>
            </div>

            <div style={{ background: 'var(--surface-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>Current Location</span>
                <strong style={{ color: '#A855F7' }}>London Sorting Office</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Transit Method</span>
                <span>Royal Mail Special Delivery</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Posted at Local Post Office (14:30)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#A855F7', boxShadow: '0 0 8px #A855F7' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>Arrived at Sorting Center (18:15)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', opacity: 0.4 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#888' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out for Delivery to Workshop</span>
              </div>
            </div>
          </div>
        )
      case 2:
        return renderRepairMockup()
      case 3:
        return (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.05)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#22C55E' }}>
                <CheckCircle size={20} />
              </div>
              <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Repaired & Insured</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.2rem' }}>Payment verified. Device dispatched for return.</p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>Return Carrier</span>
                <span style={{ color: 'var(--text-primary)' }}>Royal Mail Special Delivery</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>Tracking Number</span>
                <span style={{ color: '#00D2FF', fontFamily: 'monospace' }}>SD88229910GB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Insurance Limit</span>
                <span style={{ color: '#22C55E' }}>£750.00 (Standard)</span>
              </div>
            </div>

            <div style={{
              background: '#22C55E',
              color: 'var(--bg-color)',
              padding: '0.6rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textAlign: 'center',
            }}>
              📦 Track Return Shipment
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderDropOffMockup = (stepIdx = activeStep) => {
    switch (stepIdx) {
      case 0:
        return (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(0, 210, 255, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 210, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#00D2FF', fontFamily: 'var(--font-jetbrains)', fontWeight: 600 }}>APPOINTMENT SLOT</span>
              <span style={{ fontSize: '0.7rem', color: '#22C55E' }}>ACTIVE QUEUE</span>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Thursday, 18th June</p>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '0.5rem', background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Afternoon Slot</span>
                  <span style={{ color: '#00D2FF', fontWeight: 700 }}>12:00 - 15:00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '0.5rem', opacity: 0.5 }}>
                  <span>Morning Slot</span>
                  <span>09:00 - 12:00</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
              * Queue priority is secured. Drop-offs can be rescheduled up to 2 hours before the slot.
            </div>
          </div>
        )
      case 1:
        return (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(168, 85, 247, 0.15)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(168, 85, 247, 0.05)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: '380px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
                🏢
              </div>
            </div>
            <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Workshop Check-In Pass</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Present this pass at the reception counter.</p>

            <div style={{ background: '#FFF', padding: '0.5rem', width: '100px', height: '100px', margin: '0 auto 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '80px', height: '80px' }}>
                {[...Array(16)].map((_, i) => (
                  <div key={i} style={{ background: (i % 3 === 0 || i % 4 === 1) ? '#000' : '#FFF' }} />
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface-secondary)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>📍 London Workshop Hub, N12</span>
            </div>
          </div>
        )
      case 2:
        return renderRepairMockup()
      case 3:
        return renderCompletionMockup()
      default:
        return null
    }
  }

  const renderActiveMockup = (stepIdx = activeStep) => {
    if (activeChannel === 'HOME_VISIT') {
      switch (stepIdx) {
        case 0: return renderBookingMockup()
        case 1: return renderDispatchMockup()
        case 2: return renderRepairMockup()
        case 3: return renderCompletionMockup()
        default: return renderBookingMockup()
      }
    } else if (activeChannel === 'MAIL_IN') {
      return renderMailInMockup(stepIdx)
    } else {
      return renderDropOffMockup(stepIdx)
    }
  }

  const FloatingTimeline = () => {
    return (
      <div 
        className="floating-timeline-wrapper"
        style={{
          position: 'fixed',
          right: '28px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3.25rem',
          padding: '3rem 0',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          backdropFilter: 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div 
          className="floating-timeline-track"
          style={{
            position: 'absolute',
            top: '4.25rem',
            bottom: '4.25rem',
            width: '3px',
            background: 'var(--border)',
            zIndex: 1,
            borderRadius: '1.5px',
          }}
        >
          <div 
            style={{
              width: '100%',
              height: `${scrollProgress}%`,
              background: 'linear-gradient(to bottom, #00D2FF, #A855F7, #EC4899, #22C55E)',
              borderRadius: '1.5px',
              transition: 'height 0.1s ease-out',
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isActive = activeStep === idx
          const stepColor = step.color
          const Icon = step.icon
          
          return (
            <div 
              key={idx}
              className="group relative flex items-center justify-center"
              style={{ 
                zIndex: 2,
                cursor: 'pointer',
              }}
              onClick={() => {
                const el = document.getElementById(`how-it-works-step-${idx}`)
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <div 
                className="timeline-tooltip"
                style={{
                  position: 'absolute',
                  right: '50px',
                  whiteSpace: 'nowrap',
                  background: 'var(--surface)',
                  border: `1px solid ${isActive ? stepColor : 'var(--border)'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0) scale(1)' : 'translateX(10px) scale(0.95)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 4px 15px ${step.shadow}` : 'none',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'var(--font-syne)',
                }}
              >
                <span style={{ color: stepColor, marginRight: '0.35rem', fontFamily: 'var(--font-jetbrains)' }}>0{idx + 1}</span> 
                {step.title}
              </div>

              <div 
                className="timeline-dot-circle"
                style={{
                  width: isActive ? '42px' : '24px',
                  height: isActive ? '42px' : '24px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--bg-color)' : 'var(--surface-secondary)',
                  border: `${isActive ? '2.5px' : '1.5px'} solid ${isActive ? stepColor : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? stepColor : 'var(--text-muted)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 15px ${step.shadow}` : 'none',
                }}
              >
                <Icon size={isActive ? 22 : 13} style={{ color: isActive ? stepColor : 'var(--text-secondary)', transition: 'all 0.3s' }} />
              </div>
            </div>
          )
        })}
      </div>
    )
  }


  return (
    <>
      <Navbar />
      <FloatingTimeline />
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--bg-color)',
          color: 'var(--text-secondary)',
          paddingTop: '100px',
          paddingBottom: '5rem',
        }}
      >
        {/* CSS Keyframes Injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes moveCar {
            0% { left: 60px; top: 90px; }
            40% { left: 200px; top: 90px; }
            70% { left: 200px; top: 30px; }
            100% { left: 200px; top: 30px; }
          }
          @keyframes radarPulse {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .radar-ping {
            animation: radarPulse 2s infinite;
            box-shadow: 0 0 8px #A855F7;
          }
          .group:hover .timeline-tooltip {
            opacity: 1 !important;
            transform: translateX(0) scale(1) !important;
          }
          @media (min-width: 769px) {
            .timeline-dot-circle:hover {
              border-color: var(--text-primary) !important;
              transform: scale(1.15);
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            }
          }
          @media (max-width: 768px) {
            .floating-timeline-wrapper {
              right: 6px !important;
              gap: 2rem !important;
              padding: 2rem 0.4rem !important;
              border-radius: 18px !important;
            }
            .floating-timeline-track {
              top: 2.75rem !important;
              bottom: 2.75rem !important;
            }
            .timeline-dot-circle {
              width: 18px !important;
              height: 18px !important;
              border-width: 1.2px !important;
            }
            .timeline-dot-circle[style*="width: 42px"] {
              width: 32px !important;
              height: 32px !important;
              border-width: 2px !important;
            }
            .timeline-dot-circle svg {
              width: 10px !important;
              height: 10px !important;
            }
            .timeline-dot-circle[style*="width: 42px"] svg {
              width: 16px !important;
              height: 16px !important;
            }
            .timeline-tooltip {
              right: 38px !important;
              font-size: 0.7rem !important;
              padding: 0.3rem 0.6rem !important;
            }
          }
        `}} />

        {/* Header Section */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains)',
              color: '#00D2FF',
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            How it works
          </span>
          <h1
            className="font-syne"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.75rem',
              marginBottom: '1rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Simple. Transparent. <br className="hidden md:block" />
            <span style={{ color: '#00D2FF' }}>Smart Support.</span>
          </h1>
          <p style={{ maxWidth: '750px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            No automated phone loops or hidden call-out surcharges. We have simplified home &amp; workshop IT services. 
            Choose your preferred channel below and check the booking stages.
          </p>
        </section>

        {/* Multi-Channel Switcher Tabs */}
        <section style={{ maxWidth: '1100px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'HOME_VISIT', name: 'Home Visit', desc: 'Engineer at your door', emoji: '🏠' },
              { id: 'MAIL_IN', name: 'Mail-in Repair', desc: 'Post device to workshop', emoji: '✉️' },
              { id: 'DROP_OFF', name: 'Drop-off Repair', desc: 'In-person workshop visit', emoji: '🏢' }
            ].map(chan => {
              const isSelected = activeChannel === chan.id
              return (
                <button
                  key={chan.id}
                  onClick={() => handleChannelChange(chan.id as any)}
                  style={{
                    background: isSelected ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid ${isSelected ? '#00D2FF' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '12px',
                    padding: '0.85rem 1.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minWidth: '240px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 8px 25px rgba(0, 210, 255, 0.08)' : 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{chan.emoji}</span>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-syne)' }}>{chan.name}</span>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{chan.desc}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* RepairJourneyTimeline / Journey Flow */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* UNIFIED RESPONSIVE ACCORDION FLOW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isOpen = openMobileSteps.includes(idx)
              const isActive = activeStep === idx
              return (
                <div 
                  key={idx}
                  id={`how-it-works-step-${idx}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid rgba(255, 255, 255, 0.06)`,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    scrollMarginTop: '130px',
                  }}
                >
                  {/* Header Tab */}
                  <div 
                    onClick={() => {
                      setActiveStep(idx)
                      if (activeStep !== idx) {
                        if (!openMobileSteps.includes(idx)) {
                          setOpenMobileSteps(prev => [...prev, idx])
                        }
                      } else {
                        setOpenMobileSteps(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
                      }
                    }}
                    style={{
                      padding: '1.5rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: isOpen ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: step.color,
                        color: 'var(--bg-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 15px ${step.shadow}`,
                        fontWeight: 700,
                      }}>
                        <Icon size={18} />
                      </div>
                      <span className="font-syne" style={{
                        color: 'var(--text-primary)',
                        fontSize: '1.15rem',
                        fontWeight: 800
                      }}>
                        {step.emoji} Stage {idx + 1}: {step.title}
                      </span>
                    </div>
                    
                    <span style={{
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                      color: step.color,
                      fontSize: '0.85rem'
                    }}>▶</span>
                  </div>

                  {/* Body Content */}
                  {isOpen && (
                    <div style={{
                      padding: '2rem',
                    }}>
                      {/* Responsive Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                        {/* Description Column */}
                        <div className="md:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            margin: 0
                          }}>
                            {step.desc}
                          </p>
                          
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/book" style={{
                              background: step.color,
                              color: 'var(--bg-color)',
                              padding: '0.75rem 1.75rem',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontFamily: 'var(--font-syne)',
                              boxShadow: `0 4px 15px ${step.shadow}`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}>
                              Book Repair <ChevronRight size={14} />
                            </Link>
                            <Link href="/services" style={{
                              background: 'var(--surface-secondary)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'var(--text-primary)',
                              padding: '0.75rem 1.5rem',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontFamily: 'var(--font-syne)',
                            }}>
                              View Prices
                            </Link>
                          </div>
                        </div>

                        {/* Mockup Column */}
                        <div className="md:col-span-5" style={{ display: 'flex', justifyContent: 'center' }}>
                          {renderActiveMockup(idx)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Triple Security Guarantee Banner */}
        <section style={{ maxWidth: '1100px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}>
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.75rem' }}>
              Triple Security & Peace of Mind
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              We know your hardware and files are critical. Our triple guarantee is designed to eliminate risk and protect your assets.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div style={{
                background: 'rgba(0, 210, 255, 0.02)',
                border: '1px solid rgba(0, 210, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D2FF', marginBottom: '1.25rem' }}>
                  <Shield size={20} />
                </div>
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                  1. Data Security First
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  We implement absolute data isolation. Before any repair, we offer secure imaging options and never access your files without explicit authorization.
                </p>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.02)',
                border: '1px solid rgba(168, 85, 247, 0.1)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', marginBottom: '1.25rem' }}>
                  <Cpu size={20} />
                </div>
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                  2. No Fix, No Fee
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  If our team cannot diagnose or successfully fix the hardware/software issue, you don&apos;t pay a single penny for the repair itself.
                </p>
              </div>

              <div style={{
                background: 'rgba(34, 197, 94, 0.02)',
                border: '1px solid rgba(34, 197, 94, 0.1)',
                borderRadius: '16px',
                padding: '2rem 1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
                  3. {WARRANTY_TITLE}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                  Every single replacement part and associated repair labor comes standard with a full {WARRANTY_TEXT.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyBottomBar />
      
      {/* Pulse keyframe injection */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>
    </>
  )
}
