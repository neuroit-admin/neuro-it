'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChevronRight, User, MapPin, Clock, CheckCircle } from 'lucide-react'

const STATUS_OPTIONS = [
  'CREATED', 'DIAGNOSING', 'CONFIRMED', 'TECH_ASSIGNED',
  'ON_THE_WAY', 'RECEIVED', 'REPAIRING', 'SHIPPED_BACK', 'COMPLETED', 'CANCELLED',
]

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Created', DIAGNOSING: 'Diagnosing', CONFIRMED: 'Confirmed',
  TECH_ASSIGNED: 'Tech Assigned', ON_THE_WAY: 'On The Way',
  RECEIVED: 'Received at Workshop', REPAIRING: 'Repairing',
  SHIPPED_BACK: 'Shipped Back', COMPLETED: 'Completed/Picked Up', CANCELLED: 'Cancelled',
}

export default function AdminTicketDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [ticket, setTicket] = useState<any>(null)
  const [adminNote, setAdminNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const [shippingLabelFile, setShippingLabelFile] = useState<File | null>(null)
  const [uploadingLabel, setUploadingLabel] = useState(false)
  const [labelError, setLabelError] = useState('')

  const [returnTrackingNumInput, setReturnTrackingNumInput] = useState('')
  const [updatingTracking, setUpdatingTracking] = useState(false)
  const [trackingError, setTrackingError] = useState('')

  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`/api/tickets/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.ticket) {
            setTicket(data.ticket)
            setAdminNote(data.ticket.adminNote || '')
            setNewStatus(data.ticket.status)
            setReturnTrackingNumInput(data.ticket.returnTrackingNum || '')
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch ticket:', err)
          setLoading(false)
        })
    }
  }, [id])

  const handleUploadLabel = async () => {
    if (!shippingLabelFile) return
    setUploadingLabel(true)
    setLabelError('')
    try {
      const formData = new FormData()
      formData.append('file', shippingLabelFile)

      const res = await fetch(`/api/admin/tickets/${id}/shipping-label`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setTicket(data.ticket)
        setShippingLabelFile(null)
      } else {
        setLabelError(data.error || 'Failed to upload shipping label')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setLabelError('Network error uploading shipping label')
    } finally {
      setUploadingLabel(false)
    }
  }

  const handleSaveTracking = async () => {
    setUpdatingTracking(true)
    setTrackingError('')
    try {
      const res = await fetch(`/api/admin/tickets/${id}/return-tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTrackingNum: returnTrackingNumInput }),
      })

      const data = await res.json()
      if (res.ok) {
        setTicket(data.ticket)
      } else {
        setTrackingError(data.error || 'Failed to save return tracking number')
      }
    } catch (err) {
      console.error('Save tracking error:', err)
      setTrackingError('Network error saving return tracking number')
    } finally {
      setUpdatingTracking(false)
    }
  }

  const handleStatusChange = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setTicket((prev: any) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async () => {
    setSavingNote(true)
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote }),
      })
      if (res.ok) {
        setTicket((prev: any) => ({ ...prev, adminNote }))
      }
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
          Loading ticket details...
        </div>
      </main>
    )
  }

  if (!ticket) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
          Ticket not found. <Link href="/admin/tickets" style={{ color: '#00D2FF' }}>Go back</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
          <ChevronRight size={14} />
          <Link href="/admin/tickets" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Tickets</Link>
          <ChevronRight size={14} />
          <span className="font-mono" style={{ color: '#00D2FF' }}>{ticket.referenceCode}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="font-mono" style={{ color: '#00D2FF', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{ticket.referenceCode}</p>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {ticket.service?.name || 'Diagnostic/Repair'}
              {ticket.serviceType === 'MAIL_IN' ? (
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'rgba(0,210,255,0.15)', color: '#00D2FF', borderRadius: '12px', border: '1px solid rgba(0,210,255,0.3)', fontWeight: 600 }}>
                  📦 Mail-in Repair
                </span>
              ) : ticket.serviceType === 'DROP_OFF' ? (
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'rgba(191,85,236,0.15)', color: '#BF55EC', borderRadius: '12px', border: '1px solid rgba(191,85,236,0.3)', fontWeight: 600 }}>
                  🏢 Workshop Drop-off
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }}>
                  📍 Home Visit
                </span>
              )}
            </h1>
          </div>
          {ticket.priority === 'EMERGENCY' && (
            <span style={{ padding: '0.4rem 1rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', borderRadius: '2px', fontFamily: 'var(--font-syne)' }}>
              ⚡ EMERGENCY
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Customer Info */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
            <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>CUSTOMER</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.customer?.name || 'Guest'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ticket.customer?.email || 'No Email'}</p>
              </div>
            </div>
            {ticket.customer?.phone && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📞 {ticket.customer.phone}</p>}
          </div>

          {/* Address */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
            <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              {ticket.serviceType === 'MAIL_IN' ? 'RETURN ADDRESS' : 'ADDRESS'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0 }} />
              <div>
                {ticket.serviceType === 'MAIL_IN' ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {ticket.returnAddress || 'No Return Address Provided'}
                  </p>
                ) : ticket.serviceType === 'DROP_OFF' ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    No Visit Address Needed<br />
                    <span style={{ color: 'var(--text-muted)' }}>Workshop Drop-off at: High Street, Barnet, London, EN5 5YL</span>
                  </p>
                ) : ticket.address ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {ticket.address.houseNumber} {ticket.address.addressLine1}<br />
                    {ticket.address.city}, {ticket.address.postcode}
                  </p>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remote Support / No Address Provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issue Description */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>ISSUE DESCRIPTION</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{ticket.issueDescription || 'No description provided.'}</p>
          {ticket.aiDiagnosisNotes && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.15)', borderRadius: '4px' }}>
              <p style={{ color: '#00D2FF', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>AI DIAGNOSIS</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{ticket.aiDiagnosisNotes}</p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>PRICING</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Estimate</p>
              <p className="font-mono" style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 700 }}>
                £{ticket.estimatedPriceMin || 0}–£{ticket.estimatedPriceMax || 0}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Final Price</p>
              <p className="font-mono" style={{ color: ticket.finalPrice ? '#22C55E' : '#888', fontSize: '1.25rem', fontWeight: 700 }}>
                {ticket.finalPrice ? `£${ticket.finalPrice}` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery / Shipping details */}
        {(ticket.serviceType === 'MAIL_IN' || ticket.serviceType === 'DROP_OFF') && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              {ticket.serviceType === 'MAIL_IN' ? 'MAIL-IN LOGISTICS & PHOTOS' : 'DROP-OFF APPOINTMENT'}
            </h3>
            
            {ticket.serviceType === 'MAIL_IN' && (
              <>
                {/* Device Photos */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 className="font-syne" style={{ color: '#00D2FF', fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>CUSTOMER UPLOADED PHOTOS</h4>
                  {ticket.devicePhotos && ticket.devicePhotos.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                      {ticket.devicePhotos.map((photo: any) => (
                        <div key={photo.id} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setLightboxPhoto(photo.url)}>
                          <img src={photo.url} alt={photo.label} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.75)', color: 'var(--text-primary)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '2px' }}>
                            {photo.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No photos uploaded by customer.</p>
                  )}
                </div>

                {/* Prepaid Shipping Label */}
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h4 className="font-syne" style={{ color: '#00D2FF', fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>PREPAID SHIPPING LABEL</h4>
                  {ticket.shippingLabelUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <a href={ticket.shippingLabelUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00D2FF', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                        📄 Download Current Shipping Label PDF
                      </a>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>No shipping label uploaded yet.</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Upload/Replace Shipping Label (PDF):</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setShippingLabelFile(e.target.files?.[0] || null)}
                        style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                      />
                      <button
                        onClick={handleUploadLabel}
                        disabled={uploadingLabel || !shippingLabelFile}
                        style={{
                          padding: '0.5rem 1rem',
                          background: shippingLabelFile ? '#00D2FF' : 'var(--surface-secondary)',
                          color: shippingLabelFile ? 'var(--bg-color)' : '#888',
                          border: 'none', borderRadius: '4px', cursor: shippingLabelFile ? 'pointer' : 'default',
                          fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.8rem',
                        }}
                      >
                        {uploadingLabel ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {labelError && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{labelError}</p>}
                  </div>
                </div>

                {/* Return Tracking Number */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h4 className="font-syne" style={{ color: '#00D2FF', fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>RETURN TRACKING NUMBER (ROYAL MAIL)</h4>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={returnTrackingNumInput}
                      onChange={(e) => setReturnTrackingNumInput(e.target.value)}
                      placeholder="e.g. Special Delivery Ref JS123456789GB"
                      style={{
                        flex: 1, padding: '0.5rem 0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSaveTracking}
                      disabled={updatingTracking || returnTrackingNumInput === (ticket.returnTrackingNum || '')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: returnTrackingNumInput !== (ticket.returnTrackingNum || '') ? '#00D2FF' : 'var(--surface-secondary)',
                        color: returnTrackingNumInput !== (ticket.returnTrackingNum || '') ? 'var(--bg-color)' : '#888',
                        border: 'none', borderRadius: '4px', cursor: returnTrackingNumInput !== (ticket.returnTrackingNum || '') ? 'pointer' : 'default',
                        fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.8rem',
                      }}
                    >
                      {updatingTracking ? 'Saving...' : 'Update Tracking'}
                    </button>
                  </div>
                  {ticket.returnTrackingNum && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      Current Return Tracking: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ticket.returnTrackingNum}</span>
                    </p>
                  )}
                  {trackingError && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{trackingError}</p>}
                </div>
              </>
            )}

            {ticket.serviceType === 'DROP_OFF' && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  📅 Scheduled Drop-off Date:{' '}
                  <strong style={{ color: '#00D2FF' }}>
                    {ticket.dropOffDate ? new Date(ticket.dropOffDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                  </strong>
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  🕒 Preferred Time Slot:{' '}
                  <strong style={{ color: '#00D2FF' }}>
                    {ticket.dropOffSlot === 'MORNING'
                      ? 'Morning (9:00 - 12:00)'
                      : ticket.dropOffSlot === 'AFTERNOON'
                      ? 'Afternoon (12:00 - 15:00)'
                      : ticket.dropOffSlot === 'EVENING'
                      ? 'Evening (15:00 - 18:00)'
                      : ticket.dropOffSlot || 'Not specified'}
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Change */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>UPDATE STATUS</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
              }}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button
              onClick={handleStatusChange}
              disabled={saving || newStatus === ticket.status}
              style={{
                padding: '0.75rem 1.5rem',
                background: newStatus !== ticket.status ? '#00D2FF' : 'var(--surface-secondary)',
                color: newStatus !== ticket.status ? 'var(--bg-color)' : '#888',
                border: 'none', borderRadius: '4px', cursor: newStatus !== ticket.status ? 'pointer' : 'default',
                fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.85rem',
              }}
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>

        {/* Admin Note */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>ADMIN NOTE</h3>
          <textarea
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            placeholder="Internal notes for this ticket..."
            rows={3}
            style={{
              width: '100%', padding: '0.75rem 1rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
              borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSaveNote}
            disabled={savingNote || adminNote === (ticket.adminNote || '')}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              background: adminNote !== (ticket.adminNote || '') ? '#00D2FF' : 'var(--surface-secondary)',
              color: adminNote !== (ticket.adminNote || '') ? 'var(--bg-color)' : '#888',
              border: 'none', borderRadius: '4px', cursor: adminNote !== (ticket.adminNote || '') ? 'pointer' : 'default',
              fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.8rem',
            }}
          >
            {savingNote ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        {/* Assigned Technician */}
        {ticket.technician && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
            <h3 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>ASSIGNED TECHNICIAN</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{ticket.technician.name}</p>
                {ticket.technician.techProfile?.isDbsChecked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <CheckCircle size={12} style={{ color: '#22C55E' }} />
                    <span style={{ color: '#22C55E', fontSize: '0.75rem', fontWeight: 600 }}>DBS Checked</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'zoom-out'
          }}
        >
          <img 
            src={lightboxPhoto} 
            alt="Device Preview" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', border: '2px solid #333', borderRadius: '4px' }} 
          />
        </div>
      )}
    </main>
  )
}
