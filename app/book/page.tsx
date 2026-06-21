// =============================================================================
// Neuro IT — Booking Page (Production)
// =============================================================================
'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Navbar               from '@/components/layout/Navbar'
import ServiceSelector      from '@/components/booking/ServiceSelector'
import PricingConfirmation  from '@/components/booking/PricingConfirmation'
import BookingSuccess       from '@/components/booking/BookingSuccess'
import { CheckCircle }      from 'lucide-react'

export type BookingData = {
  sessionToken: string
  messages: Array<{ role: string; content: string }>
  issueDescription: string
  gdprConsent: boolean
  selectedService: {
    id: string; name: string; slug: string
    basePriceMin: number; basePriceMax: number
    callOutFee: number; isEmergencyReady: boolean
  } | null
  address: {
    postcode: string; houseNumber: string
    addressLine1: string; city: string
    isUlez: boolean; isCongestion: boolean
    inCoverage?: boolean
    zone?: 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX' | null
  } | null
  isEmergency: boolean
  referenceCode: string | null
  email?: string
  securityToken?: string
  ticketId?: string
  serviceType?: string
  dropOffDate?: string
  dropOffSlot?: string
  photoUrls?: string[]
}

const STEPS = ['Service & Address', 'Confirm Price', 'Complete']

function BookingFlow() {
  const sessionToken = useRef(crypto.randomUUID()).current
  const [step, setStep] = useState(0)
  const [bookingData, setBookingData] = useState<BookingData>({
    sessionToken,
    messages: [],
    issueDescription: '',
    gdprConsent: false,
    selectedService: null,
    address: null,
    isEmergency: false,
    referenceCode: null,
    email: '',
    serviceType: 'HOME_VISIT',
  })

  const updateData = (partial: Partial<BookingData>) =>
    setBookingData(prev => ({ ...prev, ...partial }))

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neuro_it_pending_booking')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setBookingData(parsed)
          setStep(1) // Move directly to step 2 (Confirm Price)
          localStorage.removeItem('neuro_it_pending_booking')
        } catch (err) {
          console.error('Failed to restore pending booking data:', err)
        }
      }
    }
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '72px', display: 'flex', flexDirection: 'column' }}>

      {/* Flowing progress animation styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowGlow {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .flowing-progress-bar {
          background: linear-gradient(90deg, #00D2FF 0%, #00F5FF 25%, #FFFFFF 50%, #00F5FF 75%, #00D2FF 100%) !important;
          background-size: 200% auto !important;
          animation: flowGlow 3s linear infinite !important;
        }
        @keyframes circleGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(0, 210, 255, 0.3); }
          50% { box-shadow: 0 0 16px rgba(0, 210, 255, 0.7); }
        }
        .active-glow-step {
          animation: circleGlow 2s infinite ease-in-out !important;
        }
      `}} />

      {/* Step indicator */}
      {step < 3 && (
        <div style={{ background: 'transparent', padding: '1.5rem 1rem' }}>
          <div className="max-w-[280px] md:max-w-[700px] w-full mx-auto relative flex items-center justify-between">
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--border)', transform: 'translateY(-50%)', zIndex: 0 }} />
            <div
              className="flowing-progress-bar"
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: '2px',
                transform: 'translateY(-50%)',
                width: `${(step / (STEPS.length - 1)) * 100}%`,
                transition: 'width 0.4s ease',
                zIndex: 0
              }}
            />
            {STEPS.map((label, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                <div
                  className={i === step ? 'active-glow-step' : ''}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 0.3s ease',
                    ...(i < step
                      ? { background: '#00D2FF', color: 'var(--bg-color)' }
                      : i === step
                      ? { background: '#00D2FF', color: 'var(--bg-color)' }
                      : { background: 'var(--surface-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' })
                  }}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-syne)', color: i <= step ? '#E0E0E0' : '#888888', display: 'none' }} className="md:block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 0 && (
          <ServiceSelector
            bookingData={bookingData}
            updateData={updateData}
            onNext={() => setStep(1)}
            onBack={() => window.history.back()}
          />
        )}
        {step === 1 && (
          <PricingConfirmation
            bookingData={bookingData}
            updateData={updateData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && <BookingSuccess bookingData={bookingData} />}
      </div>
    </main>
  )
}

export default function BookPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading booking form...</div>}>
        <BookingFlow />
      </Suspense>
    </>
  )
}
