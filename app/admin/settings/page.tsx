'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Save, MessageSquare, Phone, AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    flat_deposit_fee: '',
    whatsapp_number: '',
    contact_phone: '',
    dispatch_status: 'HIGH_DEMAND',
    technicians_remaining: '3',
    target_region: 'London',
    next_dispatch_time: '12:15 PM',
    mail_in_promo: '',
    workshop_status_message: '',
    admin_notification_email: 'neuroit.london@gmail.com',
  })
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          const map: Record<string, string> = {}
          const descMap: Record<string, string> = {}
          data.settings.forEach((s: any) => {
            map[s.key] = s.value
            descMap[s.key] = s.description || ''
          })
          setSettings(prev => ({ ...prev, ...map }))
          setDescriptions(descMap)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err)
        setErrorMsg('Failed to load system settings.')
        setLoading(false)
      })
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      // Save all settings in parallel
      const promises = Object.entries(settings).map(([key, value]) =>
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        }).then(async res => {
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || `Failed to update ${key}`)
          }
          return res.json()
        })
      )

      await Promise.all(promises)
      setSuccessMsg('All settings updated successfully.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setErrorMsg(err.message || 'Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>Settings</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
                System Settings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Configure global variables, pricing, and messaging parameters.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading system settings...</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {successMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid #22C55E', color: '#22C55E', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <CheckCircle size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Booking & Fees */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Booking & Fees
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Flat Booking Deposit (£)</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>£</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.flat_deposit_fee}
                      onChange={e => handleChange('flat_deposit_fee', e.target.value)}
                      placeholder="15.00"
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem',
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    {descriptions.flat_deposit_fee || 'Flat deposit fee charged during the booking checkout flow for all zones.'}
                  </p>
                </div>
              </div>

              {/* Contact Channels */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Contact & Communication
                </h2>

                {/* WhatsApp */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>WhatsApp Contact Number</label>
                  <div style={{ position: 'relative' }}>
                    <MessageSquare size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={e => handleChange('whatsapp_number', e.target.value)}
                      placeholder="e.g. 447700000000"
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    {descriptions.whatsapp_number || 'Business WhatsApp number (without leading + or 00, e.g. 447700000000) for chat widget and booking bypass redirection.'}
                  </p>
                </div>

                {/* Contact Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Office Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={settings.contact_phone}
                      onChange={e => handleChange('contact_phone', e.target.value)}
                      placeholder="e.g. 02000000000"
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    {descriptions.contact_phone || 'Primary office landline phone number displayed across the website header and footer.'}
                  </p>
                </div>

                {/* Admin Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Admin Notification Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      value={settings.admin_notification_email}
                      onChange={e => handleChange('admin_notification_email', e.target.value)}
                      placeholder="e.g. neuroit.london@gmail.com"
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    {descriptions.admin_notification_email || 'Email address where new ticket/repair notifications are sent.'}
                  </p>
                </div>
              </div>

              {/* Urgency & Capacity Settings */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Urgency & Capacity Messages
                </h2>

                {/* Dispatch Status Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Dispatch Status Alert Mode</label>
                  <select
                    value={settings.dispatch_status || 'HIGH_DEMAND'}
                    onChange={e => handleChange('dispatch_status', e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  >
                    <option value="HIGH_DEMAND">High Demand Mode (Only X slots left today)</option>
                    <option value="FULLY_BOOKED">Fully Booked Mode (Suggest booking for tomorrow)</option>
                  </select>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Control the urgency mode displayed in the top header alert bar across the booking flow.
                  </p>
                </div>

                {/* Technicians Slots Remaining */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Technician Slots Remaining</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.technicians_remaining || '3'}
                    onChange={e => handleChange('technicians_remaining', e.target.value)}
                    placeholder="3"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Number of active technicians/slots left to show when High Demand mode is active.
                  </p>
                </div>

                {/* Target Region */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Target Region Name</label>
                  <input
                    type="text"
                    value={settings.target_region || 'London'}
                    onChange={e => handleChange('target_region', e.target.value)}
                    placeholder="London"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Name of the target city or region coverage focus shown in the header alert.
                  </p>
                </div>

                {/* Next Dispatch Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Next Dispatch Time (Home Visit)</label>
                  <input
                    type="text"
                    value={settings.next_dispatch_time || ''}
                    onChange={e => handleChange('next_dispatch_time', e.target.value)}
                    placeholder="12:15 PM"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Next available dispatch time shown in the Home Visit description box (e.g. "12:15 PM").
                  </p>
                </div>

                {/* Mail-in Promo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Mail-in Promo Incentive</label>
                  <input
                    type="text"
                    value={settings.mail_in_promo || ''}
                    onChange={e => handleChange('mail_in_promo', e.target.value)}
                    placeholder="Get a free screen protector with all postage repairs this week!"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Promo text displayed under the Mail-in description box. Leave empty to hide.
                  </p>
                </div>

                {/* Workshop Status Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Workshop Drop-off Turnaround Status</label>
                  <input
                    type="text"
                    value={settings.workshop_status_message || ''}
                    onChange={e => handleChange('workshop_status_message', e.target.value)}
                    placeholder="Average turnaround: 45 minutes for screens & batteries today!"
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                    Live turnaround message displayed under the Drop-off description box. Leave empty to hide.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 2rem',
                    background: '#00D2FF',
                    color: 'var(--bg-color)',
                    border: 'none',
                    borderRadius: '2px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-syne)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Saving Settings...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
