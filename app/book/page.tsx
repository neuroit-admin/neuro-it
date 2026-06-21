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

  const [dispatchStatus, setDispatchStatus] = useState('HIGH_DEMAND')
  const [techsRemaining, setTechsRemaining] = useState('3')
  const [targetRegion, setTargetRegion] = useState('London')
  const [nextDispatchTime, setNextDispatchTime] = useState('12:15 PM')
  const [mailInPromo, setMailInPromo] = useState('')
  const [workshopStatusMessage, setWorkshopStatusMessage] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('447700000000')

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setDispatchStatus(data.settings.dispatch_status || 'HIGH_DEMAND')
          setTechsRemaining(data.settings.technicians_remaining || '3')
          setTargetRegion(data.settings.target_region || 'London')
          setNextDispatchTime(data.settings.next_dispatch_time || '12:15 PM')
          setMailInPromo(data.settings.mail_in_promo || '')
          setWorkshopStatusMessage(data.settings.workshop_status_message || '')
          setWhatsappNumber(data.settings.whatsapp_number || '447700000000')
        }
      })
      .catch(err => console.error('Failed to load settings:', err))
  }, [])

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

      {/* Top Alert Bar */}
      {step < 3 && (
        dispatchStatus === 'HIGH_DEMAND' ? (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚡ <span>High demand today: Only <strong>{techsRemaining}</strong> slots remaining for same-day dispatch in {targetRegion} 👈</span>
          </div>
        ) : (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚠️ <span>Same-day slots fully booked in {targetRegion}. Book for tomorrow and save 10%! 👈</span>
          </div>
        )
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {step === 0 && (
          <ServiceSelector
            bookingData={bookingData}
            updateData={updateData}
            onNext={() => setStep(1)}
            onBack={() => window.history.back()}
            dispatchStatus={dispatchStatus}
            techsRemaining={techsRemaining}
            targetRegion={targetRegion}
            nextDispatchTime={nextDispatchTime}
            mailInPromo={mailInPromo}
            workshopStatusMessage={workshopStatusMessage}
            whatsappNumber={whatsappNumber}
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
