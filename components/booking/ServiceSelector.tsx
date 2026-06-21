'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Zap, CheckCircle2, Laptop,
  MapPin, Mail, Building, Upload, Camera, Trash2, Loader2, AlertCircle
} from 'lucide-react'
import {
  AnimatedLaptop, AnimatedPcCase, AnimatedTerminal, AnimatedShield, AnimatedDatabase,
  AnimatedWifi, AnimatedHeadset, AnimatedSparkles, AnimatedApple, AnimatedZap
} from '@/components/icons/AnimatedIcons'
import { checkUlez } from '@/lib/ulez-static'
import type { BookingData } from '@/app/book/page'

const ICON_MAP: Record<string, any> = {
  'laptop-services': AnimatedLaptop,
  'desktop-pc': AnimatedPcCase,
  'software-os': AnimatedTerminal,
  'virus-security': AnimatedShield,
  'data-recovery': AnimatedDatabase,
  'home-network': AnimatedWifi,
  'remote-support': AnimatedHeadset,
  'new-device-setup': AnimatedSparkles,
  'apple-mac': AnimatedApple,
  'emergency': AnimatedZap
}

const THEME_MAP: Record<string, { color: string; bgGlow: string; borderHover: string; pillBg: string }> = {
  'laptop-services': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'desktop-pc': { color: '#8B5CF6', bgGlow: 'rgba(139, 92, 246, 0.08)', borderHover: 'rgba(139, 92, 246, 0.3)', pillBg: 'rgba(139, 92, 246, 0.08)' },
  'software-os': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'virus-security': { color: '#EF4444', bgGlow: 'rgba(239, 68, 68, 0.08)', borderHover: 'rgba(239, 68, 68, 0.3)', pillBg: 'rgba(239, 68, 68, 0.08)' },
  'data-recovery': { color: '#F59E0B', bgGlow: 'rgba(245, 158, 11, 0.08)', borderHover: 'rgba(245, 158, 11, 0.3)', pillBg: 'rgba(245, 158, 11, 0.08)' },
  'home-network': { color: '#22C55E', bgGlow: 'rgba(34, 197, 94, 0.08)', borderHover: 'rgba(34, 197, 94, 0.3)', pillBg: 'rgba(34, 197, 94, 0.08)' },
  'remote-support': { color: '#00D2FF', bgGlow: 'rgba(0, 210, 255, 0.08)', borderHover: 'rgba(0, 210, 255, 0.3)', pillBg: 'rgba(0, 210, 255, 0.08)' },
  'new-device-setup': { color: '#8B5CF6', bgGlow: 'rgba(139, 92, 246, 0.08)', borderHover: 'rgba(139, 92, 246, 0.3)', pillBg: 'rgba(139, 92, 246, 0.08)' },
  'apple-mac': { color: '#A3A3A3', bgGlow: 'rgba(163, 163, 163, 0.08)', borderHover: 'rgba(163, 163, 163, 0.3)', pillBg: 'rgba(163, 163, 163, 0.08)' },
  'emergency': { color: '#EF4444', bgGlow: 'rgba(239, 68, 68, 0.08)', borderHover: 'rgba(239, 68, 68, 0.3)', pillBg: 'rgba(239, 68, 68, 0.08)' },
}

const THEME_RGB_MAP: Record<string, string> = {
  'laptop-services': '0, 210, 255',
  'desktop-pc': '139, 92, 246',
  'software-os': '0, 210, 255',
  'virus-security': '239, 68, 68',
  'data-recovery': '245, 158, 11',
  'home-network': '34, 197, 94',
  'remote-support': '0, 210, 255',
  'new-device-setup': '139, 92, 246',
  'apple-mac': '163, 163, 163',
  'emergency': '239, 68, 68',
}

interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  basePriceMin: number
  basePriceMax: number
  callOutFee: number
  isEmergencyReady: boolean
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  isActive: boolean
  services: Service[]
}

interface Props {
  bookingData: BookingData
  updateData: (d: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}
export default function ServiceSelector({ bookingData, updateData, onNext, onBack }: Props) {
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
  }

  const searchParams = useSearchParams()
  const urlServiceSlug = searchParams?.get('service')
  const urlCategorySlug = searchParams?.get('cat')

  const parseOutward = (code: string) => {
    const m = code.match(/^([A-Z]{1,2})(\d+)([A-Z]?)$/i)
    if (!m) return null
    return {
      area: m[1].toUpperCase(),
      district: parseInt(m[2], 10),
      subdistrict: m[3] ? m[3].toUpperCase() : ''
    }
  }

  const matchPostcodeOutward = (outward: string, prefix: string): boolean => {
    const outParsed = parseOutward(outward)
    const prefParsed = parseOutward(prefix)
    if (!outParsed || !prefParsed) return false
    return (
      outParsed.area === prefParsed.area &&
      outParsed.district === prefParsed.district &&
      (prefParsed.subdistrict === '' || outParsed.subdistrict === prefParsed.subdistrict)
    )
  }

  const getPostcodeZoneFrontend = (pc: string): 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX' | null => {
    const clean = pc.toUpperCase().replace(/\s+/g, '')
    if (clean.length < 3) return null
    let outward = clean
    if (clean.length >= 5) {
      outward = clean.slice(0, clean.length - 3)
    }
    
    const outwardUpper = outward.toUpperCase()
    
    const zone4 = ['EN4', 'EN5', 'N2', 'N3', 'N20', 'N11', 'EN6', 'WD6', 'HA8']
    if (zone4.some(p => matchPostcodeOutward(outwardUpper, p))) return 'FREE_CALL_OUT'
    
    const zone3 = [
      'WD17', 'WD18', 'WD19', 'WD24', 'WD25',
      'EN1', 'EN2', 'EN3', 'N14', 'N21',
      'HA1', 'HA2', 'HA3', 'HA5', 'HA0', 'HA9',
      'NW1', 'NW3', 'NW5', 'N1', 'N5', 'N7'
    ]
    if (zone3.some(p => matchPostcodeOutward(outwardUpper, p))) return 'STANDARD_999'

    const zone2 = [
      'SW1', 'W1', 'W2', 'WC2', 'EC1', 'EC2', 'EC3', 'EC4',
      'E1', 'E2', 'E8', 'E9', 'E15', 'E20', 'W3', 'W5', 'W13',
      'UB1', 'UB2', 'TW9', 'TW10', 'CR0', 'CR2', 'CR7', 'SE3', 'SE10', 'SE18'
    ]
    if (zone2.some(p => matchPostcodeOutward(outwardUpper, p))) return 'LONDON_FLEX'

    return null
  }

  const checkCoverage = (pc: string): boolean => {
    return true
  }

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Urgency logic based on local hour and day of week
  const [urgencyData, setUrgencyData] = useState({ slots: 3, minsAgo: 14 })

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6

    let slots = 3
    let minsAgo = 14

    if (hour < 10) {
      slots = isWeekend ? 3 : 6
      minsAgo = isWeekend ? 62 : 45
    } else if (hour < 14) {
      slots = isWeekend ? 2 : 4
      minsAgo = isWeekend ? 35 : 22
    } else if (hour < 18) {
      slots = isWeekend ? 1 : 2
      minsAgo = isWeekend ? 18 : 11
    } else {
      slots = 1
      minsAgo = isWeekend ? 15 : 8
    }

    const randomSlotsOffset = Math.random() > 0.6 ? 1 : 0
    const finalSlots = Math.max(1, slots - randomSlotsOffset)
    const finalMinsAgo = Math.floor(Math.random() * 15) + 5

    setUrgencyData({ slots: finalSlots, minsAgo: finalMinsAgo })
  }, [])
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState(bookingData.selectedService?.id || '')
  const [issueDescription, setIssueDescription] = useState(bookingData.issueDescription || '')
  const [postcode, setPostcode] = useState(bookingData.address?.postcode || '')
  const [houseNumber, setHouseNumber] = useState(bookingData.address?.houseNumber || '')
  const [addressLine1, setAddressLine1] = useState(bookingData.address?.addressLine1 || '')
  const [postcodeError, setPostcodeError] = useState('')
  const [ulezInfo, setUlezInfo] = useState<{ isUlez: boolean; isCongestion: boolean } | null>(
    bookingData.address ? { isUlez: bookingData.address.isUlez, isCongestion: bookingData.address.isCongestion } : null
  )
  const [inCoverage, setInCoverage] = useState<boolean>(
    bookingData.address ? checkCoverage(bookingData.address.postcode) : true
  )
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)
  const [leadError, setLeadError] = useState('')

  const [serviceType, setServiceType] = useState<string>(bookingData.serviceType || 'HOME_VISIT')
  const [dropOffDate, setDropOffDate] = useState<string>(bookingData.dropOffDate || '')
  const [dropOffSlot, setDropOffSlot] = useState<string>(bookingData.dropOffSlot || 'MORNING')

  const [photoFront, setPhotoFront] = useState<string>(bookingData.photoUrls?.[0] || '')
  const [photoBack, setPhotoBack] = useState<string>(bookingData.photoUrls?.[1] || '')
  const [photoDamage, setPhotoDamage] = useState<string>(bookingData.photoUrls?.[2] || '')
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack, setUploadingBack] = useState(false)
  const [uploadingDamage, setUploadingDamage] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [backedUp, setBackedUp] = useState(false)
  const [bubbleWrapped, setBubbleWrapped] = useState(false)
  const [sturdyBox, setSturdyBox] = useState(false)

  const handlePhotoUpload = async (file: File, label: 'FRONT' | 'BACK' | 'DAMAGE') => {
    setPhotoError('')
    if (label === 'FRONT') setUploadingFront(true)
    if (label === 'BACK') setUploadingBack(true)
    if (label === 'DAMAGE') setUploadingDamage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('label', label)
      formData.append('tempSessionId', bookingData.sessionToken)

      const res = await fetch('/api/tickets/photos', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        if (label === 'FRONT') setPhotoFront(data.url)
        if (label === 'BACK') setPhotoBack(data.url)
        if (label === 'DAMAGE') setPhotoDamage(data.url)
      } else {
        setPhotoError(data.error || 'Failed to upload photo')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setPhotoError('Network error uploading photo')
    } finally {
      if (label === 'FRONT') setUploadingFront(false)
      if (label === 'BACK') setUploadingBack(false)
      if (label === 'DAMAGE') setUploadingDamage(false)
    }
  }

  useEffect(() => {
    if (serviceType === 'HOME_VISIT') {
      if (postcode && ukPostcodeRegex.test(postcode.trim())) {
        setInCoverage(checkCoverage(postcode))
      } else {
        setInCoverage(true)
      }
    } else {
      setInCoverage(true)
    }
  }, [serviceType, postcode])

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      setLeadError('Please enter a valid email address')
      return
    }

    setLeadSubmitting(true)
    setLeadError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail.trim(),
          phone: leadPhone.trim() || null,
          postcode: postcode.trim(),
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to submit request')
      }

      setLeadSuccess(true)
    } catch (err: any) {
      setLeadError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services')
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
          
          // Determine initial category and service to focus
          let initialCatSlug = data.categories[0]?.slug || ''
          let initialServiceId = bookingData.selectedService?.id || ''

          if (bookingData.selectedService?.id) {
            const matchedCat = data.categories.find((cat: Category) =>
              cat.services.some(s => s.id === bookingData.selectedService?.id)
            )
            if (matchedCat) {
              initialCatSlug = matchedCat.slug
            }
          } else if (urlServiceSlug) {
            let foundService: Service | null = null
            let foundCat: Category | null = null
            for (const cat of data.categories) {
              const s = cat.services.find((s: Service) => s.slug === urlServiceSlug)
              if (s) {
                foundService = s
                foundCat = cat
                break
              }
            }
            if (foundService && foundCat) {
              initialCatSlug = foundCat.slug
              initialServiceId = foundService.id
              updateData({
                selectedService: {
                  id: foundService.id,
                  name: foundService.name,
                  slug: foundService.slug,
                  basePriceMin: foundService.basePriceMin,
                  basePriceMax: foundService.basePriceMax,
                  callOutFee: foundService.callOutFee,
                  isEmergencyReady: foundService.isEmergencyReady
                }
              })
            }
          } else if (urlCategorySlug) {
            const matchedCat = data.categories.find((cat: Category) => cat.slug === urlCategorySlug)
            if (matchedCat) {
              initialCatSlug = matchedCat.slug
            }
          }

          setSelectedCategorySlug(initialCatSlug)
          setSelectedServiceId(initialServiceId)
        }
      } catch (err) {
        console.error('Error fetching services in booking flow:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [bookingData.selectedService, urlServiceSlug, urlCategorySlug, updateData])

  const handlePostcodeChange = (val: string) => {
    const cleanVal = val.toUpperCase()
    setPostcode(cleanVal)
    setPostcodeError('')
    if (cleanVal.length >= 5) {
      if (ukPostcodeRegex.test(cleanVal.trim())) {
        const result = checkUlez(cleanVal)
        setUlezInfo(result)
        const isCovered = checkCoverage(cleanVal)
        setInCoverage(isCovered)
      } else {
        setPostcodeError('Invalid UK postcode format')
        setInCoverage(true)
      }
    }
  }

  // Find selected service from categories list
  const getSelectedService = () => {
    for (const cat of categories) {
      const found = cat.services.find(s => s.id === selectedServiceId)
      if (found) return found
    }
    return null
  }

  const selectedService = getSelectedService()

  const isHomeVisit = serviceType === 'HOME_VISIT'
  const isMailIn = serviceType === 'MAIL_IN'
  const isDropOff = serviceType === 'DROP_OFF'

  const canProceed = (() => {
    if (!selectedServiceId || !issueDescription.trim()) return false
    if (isHomeVisit) {
      return postcode && ukPostcodeRegex.test(postcode.trim()) && houseNumber && addressLine1
    }
    if (isMailIn) {
      const addressOk = postcode && ukPostcodeRegex.test(postcode.trim()) && houseNumber && addressLine1
      const photosOk = !!photoFront && !!photoBack
      const checklistOk = backedUp && bubbleWrapped && sturdyBox
      return addressOk && photosOk && checklistOk
    }
    if (isDropOff) {
      return !!dropOffDate && !!dropOffSlot
    }
    return false
  })()

  const handleNext = () => {
    if (!canProceed || !selectedService) return
    
    const isEmergency = selectedService.slug.includes('emergency') || selectedService.slug.includes('out-of-hours')

    updateData({
      selectedService: {
        id: selectedService.id,
        name: selectedService.name,
        slug: selectedService.slug,
        basePriceMin: selectedService.basePriceMin,
        basePriceMax: selectedService.basePriceMax,
        callOutFee: selectedService.callOutFee,
        isEmergencyReady: selectedService.isEmergencyReady
      },
      issueDescription: issueDescription.trim(),
      isEmergency,
      serviceType,
      dropOffDate: isDropOff ? dropOffDate : undefined,
      dropOffSlot: isDropOff ? dropOffSlot : undefined,
      photoUrls: isMailIn ? [photoFront, photoBack, photoDamage].filter(Boolean) : undefined,
      address: (isHomeVisit || isMailIn) ? {
        postcode: postcode.trim(),
        houseNumber: houseNumber.trim(),
        addressLine1: addressLine1.trim(),
        city: 'London',
        isUlez: false,
        isCongestion: ulezInfo?.isCongestion || false,
        inCoverage: isHomeVisit ? inCoverage : true,
        zone: isHomeVisit ? getPostcodeZoneFrontend(postcode) : null,
      } : null,
    })
    onNext()
  }

  const activeCategory = categories.find(cat => cat.slug === selectedCategorySlug)

  return (
    <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '1.5rem', paddingBottom: '3rem' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
          fontSize: '0.9rem',
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Urgency / Demand Indicator */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', flexShrink: 0, fontSize: '0.9rem' }}>
          ⚡
        </span>
        <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          <strong style={{ color: '#F59E0B' }}>High demand today:</strong> Only <strong>{urgencyData.slots}</strong> technician slots remaining for same-day dispatch in London. Last booking was completed <strong>{urgencyData.minsAgo} minutes ago</strong>.
        </div>
      </div>

      {/* Service Type Selector Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Select Service Delivery Method
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Choose how you would like us to receive your device for repair:
        </p>

        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {/* Card 1: Home Visit */}
          <button
            type="button"
            onClick={() => setServiceType('HOME_VISIT')}
            className="p-3 md:p-6"
            style={{
              background: serviceType === 'HOME_VISIT' ? 'rgba(0, 210, 255, 0.08)' : 'var(--surface)',
              border: `1px solid ${serviceType === 'HOME_VISIT' ? '#00D2FF' : 'var(--border)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              position: 'relative',
              boxShadow: serviceType === 'HOME_VISIT' ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none',
            }}
          >
            <div
              className="w-8 h-8 md:w-10 md:h-10"
              style={{
                borderRadius: '50%',
                background: serviceType === 'HOME_VISIT' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: serviceType === 'HOME_VISIT' ? '#00D2FF' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-syne text-center" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                <span className="md:hidden">Home</span>
                <span className="hidden md:inline">Home Visit (On-Site)</span>
              </h3>
              <p className="hidden md:block" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, marginTop: '0.25rem', textAlign: 'left' }}>
                Vetted technician visits your home or office. Flat £15.00 deposit/travel fee applies.
              </p>
            </div>
            {serviceType === 'HOME_VISIT' && (
              <CheckCircle2 size={14} className="absolute top-2 right-2 md:top-4 md:right-4 text-[#00D2FF]" />
            )}
          </button>

          {/* Card 2: Mail-in */}
          <button
            type="button"
            onClick={() => setServiceType('MAIL_IN')}
            className="p-3 md:p-6"
            style={{
              background: serviceType === 'MAIL_IN' ? 'rgba(0, 210, 255, 0.08)' : 'var(--surface)',
              border: `1px solid ${serviceType === 'MAIL_IN' ? '#00D2FF' : 'var(--border)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              position: 'relative',
              boxShadow: serviceType === 'MAIL_IN' ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none',
            }}
          >
            <div
              className="w-8 h-8 md:w-10 md:h-10"
              style={{
                borderRadius: '50%',
                background: serviceType === 'MAIL_IN' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: serviceType === 'MAIL_IN' ? '#00D2FF' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-syne text-center" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                <span className="md:hidden">Mail-in</span>
                <span className="hidden md:inline">Mail-in (Post)</span>
              </h3>
              <p className="hidden md:block" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, marginTop: '0.25rem', textAlign: 'left' }}>
                UK-wide service. Free prepaid Royal Mail Special Delivery shipping label. Pay after repair is completed.
              </p>
            </div>
            {serviceType === 'MAIL_IN' && (
              <CheckCircle2 size={14} className="absolute top-2 right-2 md:top-4 md:right-4 text-[#00D2FF]" />
            )}
          </button>

          {/* Card 3: Drop-off */}
          <button
            type="button"
            onClick={() => setServiceType('DROP_OFF')}
            className="p-3 md:p-6"
            style={{
              background: serviceType === 'DROP_OFF' ? 'rgba(0, 210, 255, 0.08)' : 'var(--surface)',
              border: `1px solid ${serviceType === 'DROP_OFF' ? '#00D2FF' : 'var(--border)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.85rem',
              position: 'relative',
              boxShadow: serviceType === 'DROP_OFF' ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none',
            }}
          >
            <div
              className="w-8 h-8 md:w-10 md:h-10"
              style={{
                borderRadius: '50%',
                background: serviceType === 'DROP_OFF' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: serviceType === 'DROP_OFF' ? '#00D2FF' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              <Building size={18} />
            </div>
            <div>
              <h3 className="font-syne text-center" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                <span className="md:hidden">Drop-off</span>
                <span className="hidden md:inline">Drop-off (In-Person)</span>
              </h3>
              <p className="hidden md:block" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, marginTop: '0.25rem', textAlign: 'left' }}>
                Bring your device to our Barnet workshop directly. Choose a convenient date & time slot. Pay after fix.
              </p>
            </div>
            {serviceType === 'DROP_OFF' && (
              <CheckCircle2 size={14} className="absolute top-2 right-2 md:top-4 md:right-4 text-[#00D2FF]" />
            )}
          </button>
        </div>

        {/* Dynamic Service Description Box (Mobile Only) */}
        <div className="block md:hidden mt-3">
          {serviceType === 'HOME_VISIT' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
              📍 <strong>Home Visit:</strong> Vetted technician visits your home or office. Flat £15.00 deposit/travel fee applies.
            </p>
          )}
          {serviceType === 'MAIL_IN' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
              📦 <strong>Mail-in Post:</strong> UK-wide service. Free prepaid Royal Mail Special Delivery shipping label. Pay after repair is completed.
            </p>
          )}
          {serviceType === 'DROP_OFF' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
              🏢 <strong>Drop-off Workshop:</strong> Bring your device to our Barnet workshop directly. Choose a convenient date & time slot. Pay after fix.
            </p>
          )}
        </div>
      </div>

      {/* WhatsApp Bypass Banner */}
      <div
        className="whatsapp-bypass-banner p-3 md:py-3 md:px-5"
        style={{
          background: 'rgba(37, 211, 102, 0.02)',
          border: '1px solid rgba(37, 211, 102, 0.08)',
          borderRadius: '8px',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '1rem',
        }}
      >
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447700000000'}?text=${encodeURIComponent("Hi Neuro IT, I need assistance with an IT issue. My postcode is: [   ] and my device/fault is: [   ]")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-glow-btn-whatsapp text-center"
          style={{ flexShrink: 0, padding: '0.5rem 1.25rem', fontSize: '0.78rem' }}
        >
          WhatsApp
        </a>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>
            ⚡ <strong>In a hurry?</strong> Skip the form and book instantly on WhatsApp 👈
          </p>
        </div>
      </div>

      {/* Service Selection */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Select a Service
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please select the service category and type of support you require:
        </p>

        {loading ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '4px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading available support services...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]" style={{ gap: '1.5rem' }}>
            {/* Left Category Navigation Column */}
            <div>
              {/* Category sidebar (Desktop/Tablet) */}
              <div className="hidden md:flex" style={{ flexDirection: 'column', gap: '0.35rem', position: 'sticky', top: '20px' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
                  Categories
                </span>
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.slug] || Laptop
                  const isActive = selectedCategorySlug === cat.slug
                  const theme = THEME_MAP[cat.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)' }
                  const rgb = THEME_RGB_MAP[cat.slug] || '0, 210, 255'
                  return (
                    <motion.button
                      whileHover="hover"
                      key={cat.slug}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 0.75rem',
                        background: isActive ? `rgba(${rgb}, 0.05)` : 'transparent',
                        color: isActive ? theme.color : '#888888',
                        borderLeft: `2px solid ${isActive ? theme.color : 'transparent'}`,
                        borderTop: 'none',
                        borderRight: 'none',
                        borderBottom: 'none',
                        borderRadius: isActive ? '0 4px 4px 0' : '0',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        width: '100%',
                      }}
                    >
                      <span style={{ color: theme.color, display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.75 }}>
                        <Icon size={22} style={{ flexShrink: 0 }} />
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Category selector grid (Mobile) */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {categories.map(cat => {
                  const Icon = ICON_MAP[cat.slug] || Laptop
                  const isActive = selectedCategorySlug === cat.slug
                  const theme = THEME_MAP[cat.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)' }
                  return (
                    <motion.button
                      whileHover="hover"
                      key={cat.slug}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.6rem',
                        background: isActive ? theme.bgGlow : 'var(--surface)',
                        color: isActive ? theme.color : '#888888',
                        border: `1px solid ${isActive ? theme.color : 'var(--border)'}`,
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%',
                      }}
                    >
                      <span style={{ color: theme.color, display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.75 }}>
                        <Icon size={18} style={{ flexShrink: 0 }} />
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.name.split(' ')[0]}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Right Services Grid Column */}
            {activeCategory && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', alignContent: 'start' }}>
                {activeCategory.services.map(service => {
                  const theme = THEME_MAP[activeCategory.slug] || { color: '#00D2FF', bgGlow: 'rgba(0,0,0,0)', borderHover: 'var(--border)', pillBg: 'var(--surface-secondary)' }
                  const rgb = THEME_RGB_MAP[activeCategory.slug] || '0, 210, 255'
                  const isSelected = selectedServiceId === service.id
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      onMouseMove={handleMouseMove}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = theme.color
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isSelected ? theme.color : 'var(--border)'
                      }}
                      style={{
                        padding: '1.25rem',
                        background: isSelected 
                          ? `radial-gradient(circle 140px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${rgb}, 0.15), rgba(${rgb}, 0.08) 80%), var(--surface)`
                          : `radial-gradient(circle 140px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(${rgb}, 0.12), transparent 85%), var(--surface)`,
                        border: `1px solid ${isSelected ? theme.color : 'var(--border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isSelected ? `0 8px 24px rgba(${rgb}, 0.15)` : 'none',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', width: '100%', zIndex: 1 }}>
                        <span
                          className="font-syne"
                          style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}
                        >
                          {service.name}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          {service.isEmergencyReady && (
                            <span title="Emergency support ready" style={{ color: '#EF4444' }}>
                              <Zap size={12} />
                            </span>
                          )}
                          {isSelected && <CheckCircle2 size={14} style={{ color: theme.color }} />}
                        </div>
                      </div>
                      {service.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, flex: 1, zIndex: 1 }}>
                          {service.description.length > 80 ? `${service.description.substring(0, 80)}...` : service.description}
                        </p>
                      )}
                      <p style={{ color: theme.color, fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', zIndex: 1 }}>
                        {service.basePriceMin === service.basePriceMax ? `£${service.basePriceMin}` : `£${service.basePriceMin}–£${service.basePriceMax}`}
                        {service.callOutFee > 0 && ` + £${service.callOutFee} call-out`}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Describe Issue */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Describe the Issue
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Please describe the issue or specific device faults:
        </p>
        <textarea
          value={issueDescription}
          onChange={e => setIssueDescription(e.target.value)}
          placeholder="e.g. My Windows PC displays a blue screen error, or my MacBook keyboard is sticky after a liquid spill..."
          rows={4}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '0.875rem 1rem',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 0.2s',
            fontFamily: 'inherit',
            lineHeight: 1.6,
          }}
          onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          aria-label="Describe the issue"
        />
      </div>

      {/* Address form */}
      {(isHomeVisit || isMailIn) && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {isMailIn ? 'Return Shipping Address' : 'Your Address'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {isMailIn 
              ? 'Please provide the address where we should return your repaired device:' 
              : 'Please enter your service address for the home visit:'
            }
          </p>

        {isHomeVisit && !inCoverage ? (
          /* Out of Area Lead Capture */
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#EF4444', fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>⚠️</span>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
                Out of Standard Coverage Zone
              </h3>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Our on-site engineering team operates booking deposits/travel fees (£15.00 flat) for all home visit requests across all coverage areas.
              <br /><br />
              Would you like to register your interest? Leave your email and phone number, and our team will get in touch if we can make an exception, or notify you when we expand our boundaries.
            </p>

            {leadSuccess ? (
              <div style={{ padding: '1rem', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '4px', color: '#22C55E', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
                ✓ Thank you! Your request has been successfully registered. We will contact you shortly if we can accommodate your repair.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                      Postcode
                    </label>
                    <input
                      value={postcode}
                      onChange={e => handlePostcodeChange(e.target.value)}
                      placeholder="e.g. N1 5AB"
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        border: `1px solid ${postcodeError ? '#EF4444' : 'var(--border)'}`,
                        borderRadius: '4px',
                        padding: '0.875rem 1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        fontFamily: 'var(--font-jetbrains)',
                        letterSpacing: '0.05em',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      aria-label="Lead Postcode"
                    />
                    {postcodeError && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>{postcodeError}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={leadPhone}
                      onChange={e => { setLeadPhone(e.target.value); setLeadError('') }}
                      placeholder="e.g. 07700 900077"
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '0.875rem 1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={e => { setLeadEmail(e.target.value); setLeadError('') }}
                    placeholder="john@example.com"
                    required
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '0.875rem 1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {leadError && (
                  <p style={{ color: '#EF4444', fontSize: '0.8rem', margin: 0 }}>{leadError}</p>
                )}

                <button
                  type="submit"
                  disabled={leadSubmitting || !leadEmail.includes('@')}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: leadEmail.includes('@') && !leadSubmitting ? '#00D2FF' : 'var(--surface-secondary)',
                    color: leadEmail.includes('@') && !leadSubmitting ? 'var(--bg-color)' : '#888888',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: leadEmail.includes('@') && !leadSubmitting ? 'pointer' : 'default',
                    fontWeight: 700,
                    fontFamily: 'var(--font-syne)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {leadSubmitting ? 'Submitting...' : 'Register Interest & Request Review'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447700000000'}?text=${encodeURIComponent("Hi Neuro IT, I am outside the standard operating area. I need support at postcode: " + postcode + " for service: " + (selectedService?.name || 'repair'))}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#25D366',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                💬 Click here to negotiate travel fees via WhatsApp instead
              </a>
            </div>
          </div>
        ) : (
          /* In Coverage Address Form */
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                    Postcode *
                  </label>
                  <input
                    value={postcode}
                    onChange={e => handlePostcodeChange(e.target.value)}
                    placeholder="e.g. N1 5AB"
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: `1px solid ${postcodeError ? '#EF4444' : 'var(--border)'}`,
                      borderRadius: '4px',
                      padding: '0.875rem 1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      fontFamily: 'var(--font-jetbrains)',
                      letterSpacing: '0.05em',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
                    onBlur={e => { e.target.style.borderColor = postcodeError ? '#EF4444' : 'var(--border)' }}
                    aria-label="Postcode"
                  />
                  {postcodeError && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>{postcodeError}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                    House Number / Name *
                  </label>
                  <input
                    value={houseNumber}
                    onChange={e => setHouseNumber(e.target.value)}
                    placeholder="e.g. 42 or Flat 3"
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '0.875rem 1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                    aria-label="House number or name"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                  Street Name *
                  {isMailIn && " (and Address Line 2)"}
                </label>
                <input
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="e.g. High Street"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '0.875rem 1rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#00D2FF' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                  aria-label="Street name"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                  City
                </label>
                <input
                  value="London"
                  disabled
                  style={{
                    width: '100%',
                    background: 'var(--surface-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '0.875rem 1rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                  }}
                  aria-label="City"
                />
              </div>
            </div>

            {/* Congestion Zone notice */}
            {isHomeVisit && ulezInfo?.isCongestion && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.875rem 1rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '4px',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ color: '#F59E0B', fontSize: '1.1rem' }}>⚠</span>
                <div>
                  <p style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Congestion Zone Detected
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    A £15.00 Congestion Charge may apply to this address (Mon–Fri, 7am–6pm).
                  </p>
                </div>
              </div>
            )}

            {/* Mail-in Photos and safety checklist */}
            {isMailIn && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div>
                  <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Device Photo Verification * (Required)
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '1rem' }}>
                    To comply with insurance requirements and document device condition before shipping, you must upload at least 2 photos (Front and Back). A third close-up photo of any damage is optional.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    {/* Front Photo */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', position: 'relative' }}>
                      {photoFront ? (
                        <>
                          <img src={photoFront} alt="Front View" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          <button type="button" onClick={() => setPhotoFront('')} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '2px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trash2 size={12} /> Remove
                          </button>
                        </>
                      ) : (
                        <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          {uploadingFront ? (
                            <Loader2 size={24} className="animate-spin" style={{ color: '#00D2FF' }} />
                          ) : (
                            <Camera size={24} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Front of Device *</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload Image</span>
                          <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'FRONT') }} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>

                    {/* Back Photo */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', position: 'relative' }}>
                      {photoBack ? (
                        <>
                          <img src={photoBack} alt="Back View" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          <button type="button" onClick={() => setPhotoBack('')} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '2px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trash2 size={12} /> Remove
                          </button>
                        </>
                      ) : (
                        <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          {uploadingBack ? (
                            <Loader2 size={24} className="animate-spin" style={{ color: '#00D2FF' }} />
                          ) : (
                            <Camera size={24} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Back of Device *</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload Image</span>
                          <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'BACK') }} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>

                    {/* Damage Photo */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', position: 'relative' }}>
                      {photoDamage ? (
                        <>
                          <img src={photoDamage} alt="Damage View" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                          <button type="button" onClick={() => setPhotoDamage('')} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '2px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Trash2 size={12} /> Remove
                          </button>
                        </>
                      ) : (
                        <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          {uploadingDamage ? (
                            <Loader2 size={24} className="animate-spin" style={{ color: '#00D2FF' }} />
                          ) : (
                            <Camera size={24} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Damage Close-up</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload (Optional)</span>
                          <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'DAMAGE') }} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>
                  {photoError && (
                    <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} /> {photoError}
                    </p>
                  )}
                </div>

                {/* Packaging Safety Checklist */}
                <div style={{ background: 'rgba(0, 210, 255, 0.03)', border: '1px solid rgba(0, 210, 255, 0.15)', borderRadius: '6px', padding: '1.25rem' }}>
                  <h3 className="font-syne" style={{ color: '#00D2FF', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    🛡 Safe Packaging Checklist
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, marginBottom: '1rem' }}>
                    To qualify for Royal Mail Special Delivery insurance (up to £500 valuation), please verify and check all guidelines below:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={backedUp} onChange={e => setBackedUp(e.target.checked)} style={{ marginTop: '2px' }} />
                      <span>I confirm I have backed up all personal data, or consent to the repair without data backup liability.</span>
                    </label>
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={bubbleWrapped} onChange={e => setBubbleWrapped(e.target.checked)} style={{ marginTop: '2px' }} />
                      <span>I will wrap the device in at least 3 layers of bubble wrap or heavy foam.</span>
                    </label>
                    <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={sturdyBox} onChange={e => setSturdyBox(e.target.checked)} style={{ marginTop: '2px' }} />
                      <span>I will package it inside a rigid cardboard box and tape all seams securely.</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      )}

      {/* Drop-off Date/Time and Location (only for DROP_OFF) */}
      {isDropOff && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            Drop-off Schedule & Location
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="grid grid-cols-1 md:grid-cols-2">
            {/* Appointment Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                  Select Date *
                </label>
                <input
                  type="date"
                  value={dropOffDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDropOffDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '0.875rem 1rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                  Select Time Slot *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 'MORNING', label: 'Morning (9:00 - 12:00)' },
                    { value: 'AFTERNOON', label: 'Afternoon (12:00 - 15:00)' },
                    { value: 'EVENING', label: 'Evening (15:00 - 18:00)' }
                  ].map(slot => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setDropOffSlot(slot.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: dropOffSlot === slot.value ? 'rgba(0, 210, 255, 0.08)' : 'var(--surface)',
                        border: `1px solid ${dropOffSlot === slot.value ? '#00D2FF' : 'var(--border)'}`,
                        borderRadius: '4px',
                        color: dropOffSlot === slot.value ? '#00D2FF' : '#E0E0E0',
                        fontSize: '0.85rem',
                        fontWeight: dropOffSlot === slot.value ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workshop Address Card */}
            <div
              style={{
                padding: '1.5rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                justifyContent: 'center'
              }}
            >
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} style={{ color: '#00D2FF' }} /> Workshop Address
              </h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 600, color: '#00D2FF' }}>Neuro IT Workshop</p>
                <p>High Street</p>
                <p>Barnet, London</p>
                <p style={{ fontFamily: 'var(--font-jetbrains)' }}>EN5 5YL</p>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                Please bring your device during your selected time slot. No payment is required until the repair is fully completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {inCoverage && (
        <button
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '1rem',
            background: canProceed ? '#00D2FF' : 'var(--surface-secondary)',
            color: canProceed ? 'var(--bg-color)' : '#888888',
            border: 'none',
            borderRadius: '4px',
            cursor: canProceed ? 'pointer' : 'default',
            fontWeight: 700,
            fontFamily: 'var(--font-syne)',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
          }}
        >
          Review Price →
        </button>
      )}
    </div>
  )
}
