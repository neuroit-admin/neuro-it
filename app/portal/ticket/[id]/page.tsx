import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { CheckCircle, Clock, MapPin, User, Star, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import LeaveReviewForm from '@/components/portal/LeaveReviewForm'

const STAGES = [
  { key: 'CREATED', label: 'Request Created', desc: 'Your repair request has been received.' },
  { key: 'CONFIRMED', label: 'Appointment Confirmed', desc: 'Our team has confirmed your appointment.' },
  { key: 'TECH_ASSIGNED', label: 'Technician Assigned', desc: 'A DBS-checked technician has been assigned.' },
  { key: 'ON_THE_WAY', label: 'Technician On The Way', desc: 'Your technician is heading to you now!' },
  { key: 'REPAIRING', label: 'Repair In Progress', desc: 'Your technician is working on the issue.' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Your repair is complete. Thank you!' },
]

const STATUS_ORDER = ['CREATED', 'CONFIRMED', 'TECH_ASSIGNED', 'ON_THE_WAY', 'REPAIRING', 'COMPLETED']

const getMailInStages = (ticket: any) => {
  const hasLabel = !!ticket.shippingLabelUrl
  return [
    { key: 'CREATED', label: 'Booking Confirmed', desc: 'Your mail-in repair request has been received.', isDone: true },
    { 
      key: 'LABEL_READY', 
      label: 'Shipping Label Ready', 
      desc: hasLabel 
        ? 'Your prepaid Royal Mail Special Delivery shipping label is ready for download.' 
        : 'Your prepaid shipping label is being prepared. You will receive an email when it is ready.',
      isDone: hasLabel
    },
    { key: 'AWAITING_DEVICE', label: 'Awaiting Device', desc: 'We are waiting to receive your device at our workshop.', isDone: ticket.status !== 'CREATED' },
    { key: 'RECEIVED', label: 'Received at Workshop', desc: 'Your device has arrived at our workshop.', isDone: ['RECEIVED', 'REPAIRING', 'SHIPPED_BACK', 'COMPLETED'].includes(ticket.status) },
    { key: 'REPAIRING', label: 'Repair In Progress', desc: 'Our team is actively diagnosing and repairing your device.', isDone: ['REPAIRING', 'SHIPPED_BACK', 'COMPLETED'].includes(ticket.status) },
    { key: 'SHIPPED_BACK', label: 'Shipped Back', desc: ticket.returnTrackingNum ? `Your repaired device has been shipped back to you. Royal Mail Tracking Number: ${ticket.returnTrackingNum}` : 'Your repaired device has been shipped back to you.', isDone: ['SHIPPED_BACK', 'COMPLETED'].includes(ticket.status) },
    { key: 'COMPLETED', label: 'Completed', desc: 'Your repair is complete. Thank you!', isDone: ticket.status === 'COMPLETED' },
  ]
}

const getDropOffStages = (ticket: any) => {
  const appointmentDesc = ticket.scheduledFor 
    ? `Please drop off your device on ${new Date(ticket.scheduledFor).toLocaleDateString('en-GB')} during the ${ticket.dropOffSlot === 'MORNING' ? 'Morning (9:00 - 12:00)' : ticket.dropOffSlot === 'AFTERNOON' ? 'Afternoon (12:00 - 15:00)' : 'Evening (15:00 - 18:00)'} slot.`
    : 'Please drop off your device at our workshop.'
  
  return [
    { key: 'CREATED', label: 'Booking Confirmed', desc: 'Your drop-off repair request has been received.', isDone: true },
    { key: 'AWAITING_DROP_OFF', label: 'Awaiting Drop-off', desc: appointmentDesc, isDone: ticket.status !== 'CREATED' },
    { key: 'RECEIVED', label: 'Received at Workshop', desc: 'Your device has been received at our workshop.', isDone: ['RECEIVED', 'REPAIRING', 'COMPLETED'].includes(ticket.status) },
    { key: 'REPAIRING', label: 'Repairing', desc: 'Our team is actively diagnosing and repairing your device.', isDone: ['REPAIRING', 'COMPLETED'].includes(ticket.status) },
    { key: 'COMPLETED', label: 'Ready for Pickup', desc: 'Your repair is complete and ready for pickup at our workshop.', isDone: ticket.status === 'COMPLETED' },
  ]
}

export default async function TicketDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { token } = await searchParams
  const session = await getServerSession(authOptions)

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      service: true,
      address: true,
      review: true,
      devicePhotos: true,
      technician: {
        include: {
          techProfile: true,
        },
      },
    },
  })

  if (!ticket) {
    notFound()
  }

  // Authorisation: check if token matches OR user session owns the ticket
  const isTokenValid = token && ticket.securityToken === token
  const userId = session?.user ? (session.user as any).id : null
  const userRole = session?.user ? (session.user as any).role : null

  if (!isTokenValid) {
    if (!session?.user) {
      redirect(`/login?callbackUrl=/portal/ticket/${id}`)
    }
    if (userRole === 'CUSTOMER' && ticket.customerId !== userId) {
      redirect('/portal')
    }
  }

  const isHomeVisit = ticket.serviceType === 'HOME_VISIT' || !ticket.serviceType
  const isMailIn = ticket.serviceType === 'MAIL_IN'
  const isDropOff = ticket.serviceType === 'DROP_OFF'

  let stages: any[] = STAGES
  let currentStageIndex = STATUS_ORDER.indexOf(ticket.status)

  if (isMailIn) {
    stages = getMailInStages(ticket)
    currentStageIndex = stages.findIndex(s => !s.isDone)
    if (currentStageIndex === -1) currentStageIndex = stages.length - 1
  } else if (isDropOff) {
    stages = getDropOffStages(ticket)
    currentStageIndex = stages.findIndex(s => !s.isDone)
    if (currentStageIndex === -1) currentStageIndex = stages.length - 1
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '72px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/portal" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>My Portal</Link>
            <ChevronRight size={14} />
            <span className="font-mono" style={{ color: '#00D2FF' }}>{ticket.referenceCode}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="font-mono" style={{ color: '#00D2FF', fontSize: '0.85rem' }}>
                {ticket.referenceCode}
              </span>
              <span 
                style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '2px', 
                  background: isMailIn ? 'rgba(167, 139, 250, 0.15)' : isDropOff ? 'rgba(34, 211, 238, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                  color: isMailIn ? '#A78BFA' : isDropOff ? '#22D3EE' : '#34D399'
                }}
              >
                {isMailIn ? 'MAIL-IN' : isDropOff ? 'DROP-OFF' : 'HOME VISIT'}
              </span>
            </div>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              {ticket.service?.name}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Booked {new Date(ticket.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Status Timeline */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.5rem' }}>
              Repair Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {stages.map((stage, i) => {
                const isCompleted = isMailIn || isDropOff ? stage.isDone : i < currentStageIndex
                const isCurrent = i === currentStageIndex
                const isFuture = isMailIn || isDropOff ? !stage.isDone && i !== currentStageIndex : i > currentStageIndex

                return (
                  <div key={stage.key} style={{ display: 'flex', gap: '1rem' }}>
                    {/* Timeline line + dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.3s ease',
                          ...(isCompleted
                            ? { background: '#00D2FF', border: '2px solid #00D2FF' }
                            : isCurrent
                            ? { background: 'transparent', border: '2px solid #00D2FF', boxShadow: '0 0 12px rgba(0,210,255,0.5)' }
                            : { background: 'transparent', border: '2px solid var(--border)' }),
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle size={14} style={{ color: 'var(--bg-color)' }} />
                        ) : isCurrent ? (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D2FF' }} />
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }} />
                        )}
                      </div>
                      {i < stages.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            minHeight: '32px',
                            background: isCompleted ? '#00D2FF' : 'var(--border)',
                            margin: '4px 0',
                            transition: 'background 0.3s ease',
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ paddingBottom: i < stages.length - 1 ? '1.5rem' : 0, paddingTop: '2px' }}>
                      <p
                        className="font-syne"
                        style={{
                          color: isFuture ? '#888888' : '#FFFFFF',
                          fontWeight: isCurrent ? 700 : 600,
                          fontSize: '0.95rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {stage.label}
                        {isCurrent && (
                          <span
                            style={{
                              marginLeft: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              background: 'rgba(0,210,255,0.15)',
                              color: '#00D2FF',
                              fontSize: '0.7rem',
                              borderRadius: '2px',
                              fontFamily: 'var(--font-syne)',
                            }}
                          >
                            CURRENT
                          </span>
                        )}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{stage.desc}</p>

                      {/* Technician card at TECH_ASSIGNED (only for Home Visit) */}
                      {isHomeVisit && stage.key === 'TECH_ASSIGNED' && isCurrent && ticket.technician && (
                        <div
                          style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: 'var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <User size={22} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <div>
                            <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                              {ticket.technician.name}
                            </p>
                            {ticket.technician.techProfile?.isDbsChecked && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                <CheckCircle size={12} style={{ color: '#22C55E' }} />
                                <span style={{ color: '#22C55E', fontSize: '0.75rem', fontWeight: 600 }}>DBS Checked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Prepaid Shipping Label Box */}
            {isMailIn && ticket.shippingLabelUrl && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(0, 210, 255, 0.04)', border: '1px solid rgba(0, 210, 255, 0.15)', borderRadius: '4px' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Prepaid Shipping Label Available</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, marginBottom: '1rem' }}>
                  Please download and print your prepaid Royal Mail Special Delivery shipping label. Stick it securely on your packaged device box and hand it over at any Post Office counter.
                </p>
                <a 
                  href={ticket.shippingLabelUrl}
                  download={`Prepaid_Label_${ticket.referenceCode}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#00D2FF',
                    color: 'var(--bg-color)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-syne)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  Download Shipping Label (PDF)
                </a>
              </div>
            )}
          </div>

          {/* Location & Details Card (For Mail-in and Drop-off) */}
          {ticket.serviceType !== 'HOME_VISIT' && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#00D2FF', fontSize: '1rem' }}>🏢</span>
                <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>WORKSHOP LOCATION</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                <p style={{ fontWeight: 600, color: '#00D2FF' }}>Neuro IT Workshop</p>
                <p>High Street, Barnet, London, EN5 5YL</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Hours: Mon–Fri, 9:00am–6:00pm</p>
              </div>
            </div>
          )}

          {/* Address + Price Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.25rem' }}>
              {ticket.serviceType === 'DROP_OFF' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#00D2FF', fontSize: '0.9rem' }}>📅</span>
                    <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>APPOINTMENT</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Date: {ticket.scheduledFor ? new Date(ticket.scheduledFor).toLocaleDateString('en-GB') : 'Not scheduled'}
                    <br />Slot: {ticket.dropOffSlot === 'MORNING' ? 'Morning (9:00 - 12:00)' : ticket.dropOffSlot === 'AFTERNOON' ? 'Afternoon (12:00 - 15:00)' : 'Evening (15:00 - 18:00)'}
                  </p>
                </>
              ) : ticket.serviceType === 'MAIL_IN' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <MapPin size={14} style={{ color: '#00D2FF' }} />
                    <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>RETURN ADDRESS</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {ticket.returnAddress || 'No return address specified'}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <MapPin size={14} style={{ color: '#00D2FF' }} />
                    <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>SERVICE ADDRESS</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {ticket.address?.houseNumber} {ticket.address?.addressLine1}
                    <br />{ticket.address?.postcode}
                  </p>
                </>
              )}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={14} style={{ color: '#00D2FF' }} />
                <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>ESTIMATE</span>
              </div>
              <p className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 700 }}>
                £{ticket.estimatedPriceMin}–£{ticket.estimatedPriceMax}
              </p>
            </div>
          </div>

          {/* Device photos gallery (For Mail-in) */}
          {ticket.serviceType === 'MAIL_IN' && ticket.devicePhotos && ticket.devicePhotos.length > 0 && (
            <div style={{ marginTop: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Photos Submitted Before Sending
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {ticket.devicePhotos.map(photo => (
                  <div key={photo.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{photo.label}</span>
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={photo.url} 
                        alt={`Device photo ${photo.label}`} 
                        style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review prompt for completed tickets */}
          {ticket.status === 'COMPLETED' && (
            <div style={{ marginTop: '2rem' }}>
              {ticket.review ? (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <Star size={24} style={{ color: '#F59E0B', fill: '#F59E0B', marginBottom: '0.75rem', marginLeft: 'auto', marginRight: 'auto' }} />
                  <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                    Your Review
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        style={{
                          color: '#F59E0B',
                          fill: star <= ticket.review!.rating ? '#F59E0B' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                  {ticket.review.comment && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5, margin: '0.5rem 0' }}>
                      &ldquo;{ticket.review.comment}&rdquo;
                    </p>
                  )}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0, marginTop: '0.5rem' }}>
                    Submitted on {new Date(ticket.review.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              ) : (
                <LeaveReviewForm ticketId={ticket.id} token={token as string} />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
