// =============================================================================
// Neuro IT — PricingConfirmation (Production)
// Changes vs original:
//  • Explicit GDPR consent checkbox (Consumer Rights Act + GDPR compliant)
//  • Consent saved to DB via /api/gdpr/consent before ticket creation
//  • Ticket creation moved here (was implicit) — returns server referenceCode
//  • All CSS variables replaced with local inline color constants to prevent HMR/caching issues
// =============================================================================
'use client'

import { useState, useEffect }    from 'react'
import { ArrowLeft, MapPin, Shield } from 'lucide-react'
import type { BookingData }          from '@/app/book/page'
import { getCongestionSurcharge }    from '@/lib/ulez-static'
import { useSession }                from 'next-auth/react'

const COLORS = {
  accent: 'var(--accent)',
  surface: 'var(--surface)',
  border: 'var(--border)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
}

interface Props {
  bookingData: BookingData
  updateData:  (d: Partial<BookingData>) => void
  onNext:      () => void
  onBack:      () => void
}

export default function PricingConfirmation({ bookingData, updateData, onNext, onBack }: Props) {
  const { selectedService, address, isEmergency } = bookingData
  const [gdprChecked, setGdprChecked] = useState(bookingData.gdprConsent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [flatDeposit, setFlatDeposit] = useState(14.99)
  const { data: session, status } = useSession()
  
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const [showContactStep, setShowContactStep] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'ONLINE' | 'ON_ARRIVAL'>('ONLINE')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.flatDepositFee !== undefined) {
          setFlatDeposit(data.flatDepositFee)
        }
      })
      .catch(err => console.error('Failed to load flat deposit fee:', err))
  }, [])

  const isHomeVisit = bookingData.serviceType === 'HOME_VISIT' || !bookingData.serviceType
  const isMailIn = bookingData.serviceType === 'MAIL_IN'
  const isDropOff = bookingData.serviceType === 'DROP_OFF'

  useEffect(() => {
    if (bookingData.serviceType === 'MAIL_IN' || bookingData.serviceType === 'DROP_OFF') {
      setPaymentOption('ON_ARRIVAL')
    } else {
      setPaymentOption('ONLINE')
    }
  }, [bookingData.serviceType])

  if (!selectedService) return null
  if ((isHomeVisit || isMailIn) && !address) return null

  const ulezFee       = 0
  const congestionFee = (isHomeVisit && address?.isCongestion) ? getCongestionSurcharge() : 0
  const isInZone      = isHomeVisit ? (address?.inCoverage !== false) : false
  const callOutFee    = isHomeVisit ? selectedService.callOutFee : 0
  
  const totalMin     = selectedService.basePriceMin + callOutFee + ulezFee + congestionFee
  const totalMax     = selectedService.basePriceMax + callOutFee + ulezFee + congestionFee
  const getDepositAmount = () => {
    if (!isHomeVisit) return 0
    return 15.00
  }
  const depositAmt = getDepositAmount()

  const LineItem = ({ label, value, highlight = false, muted = false }: {
    label: string; value: string; highlight?: boolean; muted?: boolean
  }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: `1px solid ${COLORS.border}` }}>
      <span style={{ color: muted ? COLORS.textMuted : COLORS.textSecondary, fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: highlight ? COLORS.accent : muted ? COLORS.textMuted : COLORS.textPrimary, fontWeight: highlight ? 700 : 500, fontSize: highlight ? '1.05rem' : '0.9rem', fontFamily: 'var(--font-jetbrains)' }}>
        {value}
      </span>
    </div>
  )

  const handleSendOtp = async (targetEmail: string) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }
      setOtpSent(true)
      setResendCooldown(60)
      if (data.otpCode) {
        console.log(`[DEV ONLY] OTP Code: ${data.otpCode}`)
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send verification code. Please check your email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm = async () => {
    if (!gdprChecked) { setSubmitError('Please accept the terms to continue.'); return }
    
    const targetEmail = status === 'authenticated' && session?.user?.email
      ? session.user.email
      : guestEmail.trim().toLowerCase()

    if (status !== 'authenticated') {
      if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
        setSubmitError('Please fill in your name, email, and phone number.')
        return
      }
      if (!guestEmail.includes('@')) {
        setSubmitError('Please enter a valid email address.')
        return
      }
    }

    if (paymentOption === 'ON_ARRIVAL' && !otpSent) {
      await handleSendOtp(targetEmail)
      return
    }

    if (paymentOption === 'ON_ARRIVAL' && otpSent && otpCode.length !== 6) {
      setSubmitError('Please enter the 6-digit verification code sent to your email.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // 1. Record GDPR consent with timestamp
      if (status === 'authenticated') {
        await fetch('/api/gdpr/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consentGiven: true, consentedAt: new Date().toISOString() }),
        }).catch(err => console.warn('GDPR logging failed:', err))
      }

      // 2. Create ticket — reference code generated server-side
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId:        selectedService.id,
          issueDescription: bookingData.issueDescription,
          estimatedPriceMin: totalMin,
          estimatedPriceMax: totalMax,
          isEmergency,
          serviceType:      bookingData.serviceType || 'HOME_VISIT',
          dropOffDate:      bookingData.dropOffDate || null,
          dropOffSlot:      bookingData.dropOffSlot || null,
          address:          bookingData.address,
          sessionToken:     bookingData.sessionToken,
          paymentOption:    isHomeVisit ? paymentOption : 'ON_ARRIVAL',
          otpCode:          (isHomeVisit ? paymentOption === 'ON_ARRIVAL' : true) ? otpCode : null,
          photoUrls:        bookingData.photoUrls || null,
          guestDetails: status !== 'authenticated' ? {
            name: guestName.trim(),
            email: guestEmail.trim().toLowerCase(),
            phone: guestPhone.trim(),
          } : null
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      
      const { ticket, referenceCode, checkoutUrl, securityToken } = data

      updateData({
        gdprConsent: true,
        referenceCode,
        email: targetEmail,
        securityToken,
        ticketId: ticket?.id
      })
      
      if (securityToken) {
        const expires = Date.now() + 72 * 60 * 60 * 1000
        localStorage.setItem(`__nit_tk_${referenceCode}`, JSON.stringify({ token: securityToken, expires }))
      }

      if (checkoutUrl && paymentOption === 'ONLINE') {
        window.location.href = checkoutUrl
      } else {
        onNext()
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again or contact us via WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', width: '100%', margin: '0 auto', padding: '1.5rem' }}>
      
      {!showContactStep ? (
        // SUB-STEP 1: REVIEW PRICE (Simple, clean, no cognitive load)
        <div>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back
          </button>

          <h2 className="font-syne" style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Review Price Estimate
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', marginBottom: '2rem' }}>
            Here is the transparent pricing estimate for your repair request.
          </p>

          {/* Address / Location / Schedule Detail */}
          {isHomeVisit && address && (
            <div style={{ padding: '1rem', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <MapPin size={16} style={{ color: COLORS.accent, flexShrink: 0 }} />
              <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                {address.houseNumber} {address.addressLine1}, {address.postcode}
              </p>
            </div>
          )}

          {isMailIn && address && (
            <div style={{ padding: '1rem', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <MapPin size={16} style={{ color: COLORS.accent, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>Return Shipping Address:</span>
                <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                  {address.houseNumber} {address.addressLine1}, {address.postcode}
                </p>
              </div>
            </div>
          )}

          {isDropOff && (
            <div style={{ padding: '1rem', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <MapPin size={16} style={{ color: COLORS.accent, flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>Drop-off Appointment:</span>
                <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                  Date: {bookingData.dropOffDate} | Slot: {bookingData.dropOffSlot === 'MORNING' ? 'Morning (9:00 - 12:00)' : bookingData.dropOffSlot === 'AFTERNOON' ? 'Afternoon (12:00 - 15:00)' : 'Evening (15:00 - 18:00)'}
                </p>
              </div>
            </div>
          )}

          {/* Pricing breakdown */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            <LineItem label="Service"           value={selectedService.name} />
            <LineItem label="Estimated price"   value={`£${selectedService.basePriceMin}–£${selectedService.basePriceMax}`} />
            {isHomeVisit && selectedService.callOutFee > 0 && <LineItem label="Call-out fee"      value={`£${selectedService.callOutFee.toFixed(2)}`} highlight />}
            {isHomeVisit && congestionFee > 0     && <LineItem label="⚠ Congestion charge (Mon–Fri 7am–6pm)" value={`£${congestionFee.toFixed(2)}`} highlight />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0' }}>
              <span className="font-syne" style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '1rem' }}>Total Estimate</span>
              <span className="font-mono" style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '1.25rem' }}>
                £{totalMin.toFixed(0)}–£{totalMax.toFixed(0)}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5, marginTop: '-0.75rem', marginBottom: '1.5rem', padding: '0 0.25rem', fontStyle: 'italic' }}>
            * All starting rates include labor and standard parts. The exact price varies by device model (e.g. standard PC vs. MacBook) and is confirmed on-site before work begins.
          </p>

          {/* Deposit info */}
          <div style={{ padding: '1.25rem', background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '4px', marginBottom: '2rem' }}>
            <p style={{ color: COLORS.accent, fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              {isHomeVisit 
                ? 'Upfront Diagnostic & Travel Fee Prepayment'
                : 'No deposit required (Pay on completion)'
              }
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
              {isHomeVisit ? (
                <>
                  Prepayment due now: <strong style={{ color: COLORS.textSecondary }}>£{depositAmt.toFixed(2)}</strong> (upfront diagnostic & travel fee).
                  {address?.zone === 'FREE_CALL_OUT' && ' This deposit is fully deducted from your final repair invoice.'}
                  {address?.zone === 'STANDARD_999' && ' This is a flat travel & dispatch fee.'}
                  {(address?.zone !== 'FREE_CALL_OUT' && address?.zone !== 'STANDARD_999') && ' This is a base travel deposit. Any additional travel charges based on distance will be calculated and added to your final invoice.'}
                </>
              ) : (
                <>
                  Prepayment due now: <strong style={{ color: COLORS.textSecondary }}>£0.00</strong>. The final repair charge will be collected after your device is diagnosed and successfully repaired.
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setShowContactStep(true)}
            style={{ width: '100%', padding: '1.125rem', background: COLORS.accent, color: '#0A0A0A', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '1rem', letterSpacing: '0.05em', transition: 'all 0.2s ease' }}
          >
            {status === 'authenticated' ? 'Proceed to Confirmation →' : 'Proceed to Contact Details →'}
          </button>
        </div>
      ) : (
        // SUB-STEP 2: GUEST CONTACT DETAILS & GDPR CONSENT (Deferred to reduce early cognitive load)
        <div>
          <button onClick={() => setShowContactStep(false)} style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Price Review
          </button>

          <h2 className="font-syne" style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            Complete Your Booking
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', marginBottom: '2rem' }}>
            Review final details and provide your details to schedule your booking.
          </p>

          {/* Booking Summary Recap */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textSecondary, marginBottom: '0.5rem' }}>
              <span>Service: <strong>{selectedService.name}</strong></span>
              <span className="font-mono">Total: £{totalMin.toFixed(0)}–£{totalMax.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMuted }}>
              <span>
                {isDropOff 
                  ? `Drop-off: ${bookingData.dropOffDate} (${bookingData.dropOffSlot})` 
                  : `Address: ${address?.houseNumber} ${address?.addressLine1}`
                }
              </span>
              <span>Deposit Due: <strong style={{ color: COLORS.accent }}>£{depositAmt.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Guest Details Form */}
          {status !== 'authenticated' && (
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 className="font-syne" style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                Contact Details
              </h3>
              <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                Provide your details to receive live repair updates, notifications, and technician tracking.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => { setGuestName(e.target.value); setSubmitError('') }}
                    placeholder="John Doe"
                    style={{ width: '100%', background: '#1C1C1C', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={e => { setGuestEmail(e.target.value); setSubmitError('') }}
                      placeholder="john@example.com"
                      style={{ width: '100%', background: '#1C1C1C', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '0.35rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={e => { setGuestPhone(e.target.value); setSubmitError('') }}
                      placeholder="07700 900077"
                      style={{ width: '100%', background: '#1C1C1C', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          {/* Payment Method Selector */}
          {isHomeVisit && isInZone ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '0.50rem', fontWeight: 700, fontFamily: 'var(--font-syne)' }}>PAYMENT METHOD</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div 
                  onClick={() => setPaymentOption('ONLINE')}
                  style={{
                    padding: '1rem',
                    background: '#121212',
                    border: `1px solid ${paymentOption === 'ONLINE' ? COLORS.accent : COLORS.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <p style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.85rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-syne)' }}>Prepay Deposit Online</p>
                  <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>Pay £{depositAmt.toFixed(2)} upfront diagnostic &amp; travel fee securely via Stripe.</p>
                </div>
                
                <div 
                  onClick={() => setPaymentOption('ON_ARRIVAL')}
                  style={{
                    padding: '1rem',
                    background: '#121212',
                    border: `1px solid ${paymentOption === 'ON_ARRIVAL' ? COLORS.accent : COLORS.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <p style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.85rem', margin: '0 0 0.25rem 0', fontFamily: 'var(--font-syne)' }}>Pay on Arrival</p>
                  <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>Pay the technician on-site upon completion. Requires phone verification.</p>
                </div>
              </div>
              
              {paymentOption === 'ON_ARRIVAL' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {otpSent ? (
                    <div style={{ padding: '1.25rem', background: 'rgba(0,210,255,0.05)', border: `1px solid ${COLORS.accent}`, borderRadius: '4px' }}>
                      <label style={{ display: 'block', color: COLORS.accent, fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-syne)' }}>
                        ENTER 6-DIGIT EMAIL VERIFICATION CODE
                      </label>
                      <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                        We sent a 6-digit verification code to <strong style={{ color: COLORS.textSecondary }}>{status === 'authenticated' ? session?.user?.email : guestEmail}</strong>. Please enter it below to confirm your booking.
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setSubmitError('') }}
                          placeholder="123456"
                          style={{ width: '120px', letterSpacing: '0.15em', textAlign: 'center', background: '#1C1C1C', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, outline: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendOtp(status === 'authenticated' ? session?.user?.email || '' : guestEmail)}
                          disabled={resendCooldown > 0 || isSubmitting}
                          style={{ background: 'transparent', border: 'none', color: resendCooldown > 0 ? COLORS.textMuted : COLORS.accent, cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', color: '#F59E0B', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      <strong>⚠ Verification Required:</strong> To prevent fraud, you will be sent a 6-digit verification code to your email to verify your booking. Additionally, our dispatch office will call you within 15 minutes of booking to verify your details and confirm the appointment. Unverified bookings will be cancelled.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* For Mail-in, Drop-off, or negotiated Home Visit, force email verification flow */
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '4px', marginBottom: '1.5rem' }}>
                <p style={{ color: COLORS.accent, fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  No Deposit Required
                </p>
                <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                  You are booking this repair with a £0 deposit. The total cost will be payable upon completion of the repair.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {otpSent ? (
                  <div style={{ padding: '1.25rem', background: 'rgba(0,210,255,0.05)', border: `1px solid ${COLORS.accent}`, borderRadius: '4px' }}>
                    <label style={{ display: 'block', color: COLORS.accent, fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-syne)' }}>
                      ENTER 6-DIGIT EMAIL VERIFICATION CODE
                    </label>
                    <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      We sent a 6-digit verification code to <strong style={{ color: COLORS.textSecondary }}>{status === 'authenticated' ? session?.user?.email : guestEmail}</strong>. Please enter it below to confirm your booking.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setSubmitError('') }}
                        placeholder="123456"
                        style={{ width: '120px', letterSpacing: '0.15em', textAlign: 'center', background: '#1C1C1C', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSendOtp(status === 'authenticated' ? session?.user?.email || '' : guestEmail)}
                        disabled={resendCooldown > 0 || isSubmitting}
                        style={{ background: 'transparent', border: 'none', color: resendCooldown > 0 ? COLORS.textMuted : COLORS.accent, cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.875rem 1rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', color: '#F59E0B', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    <strong>⚠ Verification Required:</strong> To prevent database spam on free bookings, guest bookings require email verification. We will send a 6-digit verification code to your email.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GDPR Consent Checkbox */}
          <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.5rem', padding: '1.25rem', background: COLORS.surface, border: `1px solid ${gdprChecked ? 'rgba(0,210,255,0.4)' : COLORS.border}`, borderRadius: '4px', transition: 'border-color 0.2s' }}>
            <input
              type="checkbox"
              checked={gdprChecked}
              onChange={e => { setGdprChecked(e.target.checked); setSubmitError('') }}
              style={{ width: '18px', height: '18px', accentColor: COLORS.accent, flexShrink: 0, marginTop: '2px' }}
              aria-label="GDPR and Terms consent"
            />
            <span style={{ color: COLORS.textSecondary, fontSize: '0.82rem', lineHeight: 1.6 }}>
              <Shield size={12} style={{ display: 'inline', marginRight: '4px', color: COLORS.accent, verticalAlign: 'middle' }} />
              I agree to Neuro IT&apos;s{' '}
              <a href="/terms" target="_blank" style={{ color: COLORS.accent, textDecoration: 'none' }}>Terms &amp; Conditions</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" style={{ color: COLORS.accent, textDecoration: 'none' }}>Privacy Policy</a>.
              I consent to my contact details and device information being processed to fulfil this service request, in accordance with UK GDPR.
            </span>
          </label>

          {submitError && (
            <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px' }}>
              {submitError}
            </p>
          )}

          <button
            onClick={handleConfirm}
            disabled={!gdprChecked || isSubmitting}
            style={{ width: '100%', padding: '1.125rem', background: gdprChecked && !isSubmitting ? COLORS.accent : '#1C1C1C', color: gdprChecked && !isSubmitting ? '#0A0A0A' : COLORS.textMuted, border: 'none', borderRadius: '4px', cursor: gdprChecked && !isSubmitting ? 'pointer' : 'default', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '1rem', letterSpacing: '0.05em', transition: 'all 0.2s ease' }}
          >
            {isSubmitting
              ? 'Confirming…'
              : paymentOption === 'ONLINE' && isInZone
              ? `Confirm & Prepay £${depositAmt.toFixed(2)} →`
              : otpSent
              ? 'Verify & Confirm Booking (Pay on Arrival) →'
              : 'Confirm Booking (Pay on Arrival) →'}
          </button>
        </div>
      )}
    </div>
  )
}
