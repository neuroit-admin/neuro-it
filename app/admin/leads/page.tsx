'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Mail, Phone, MapPin, Trash2, Search, ArrowLeft, Loader2, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface Lead {
  id: string
  email: string
  phone: string | null
  postcode: string
  createdAt: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchLeads = () => {
    setLoading(true)
    fetch(`/api/admin/leads?search=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => {
        if (data.leads) {
          setLeads(data.leads)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch leads error:', err)
        setErrorMsg('Failed to load out-of-area lead requests.')
        setLoading(false)
      })
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead record?')) return
    setDeletingId(id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSuccessMsg('Lead record deleted successfully.')
        setLeads(prev => prev.filter(l => l.id !== id))
      } else {
        setErrorMsg(data.error || 'Failed to delete lead.')
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to delete lead.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatWhatsApp = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('44')) return clean
    if (clean.startsWith('0')) return '44' + clean.slice(1)
    return '44' + clean
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Back Link */}
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00D2FF'}
            onMouseLeave={e => e.currentTarget.style.color = '#888888'}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains)' }}>
              Out-of-Area Requests
            </span>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2.2rem', marginTop: '0.25rem' }}>
              Postcode Leads Directory
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Manage inquiries from potential customers located outside standard operating zones.
            </p>
          </div>

          {/* Success/Error Alerts */}
          {successMsg && (
            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', color: '#22C55E', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ✓ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ⚠ {errorMsg}
            </div>
          )}

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px', marginBottom: '2rem' }}>
            <input
              type="text"
              placeholder="Search by email, phone, postcode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <Search size={16} style={{ color: '#444444', position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Leads Grid/Table */}
          {loading && leads.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', padding: '3rem 0', fontFamily: 'var(--font-syne)' }}>
              <Loader2 size={18} className="animate-spin" /> Loading out-of-zone leads...
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Requested Postcode</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Received At</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#555', fontFamily: 'var(--font-jetbrains)', fontSize: '0.9rem' }}>
                          No postcode leads found.
                        </td>
                      </tr>
                    ) : (
                      leads.map(lead => (
                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {lead.email}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: lead.phone ? '#FFF' : '#444', fontSize: '0.85rem' }}>
                            {lead.phone || 'N/A'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-jetbrains)',
                              fontWeight: 700,
                              background: 'rgba(0, 210, 255, 0.1)',
                              color: '#00D2FF',
                              border: '1px solid rgba(0, 210, 255, 0.2)'
                            }}>
                              {lead.postcode}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#AAA', fontSize: '0.82rem' }}>
                            {new Date(lead.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              
                              {/* Email Quick-Link */}
                              <a
                                href={`mailto:${lead.email}?subject=${encodeURIComponent('Neuro IT Support Request')}&body=${encodeURIComponent(`Hi,\n\nWe received your request for IT support in the ${lead.postcode} area.\n\nSince you are located outside our standard green coverage zone, we would love to review your requirements and provide a custom quote.\n\nBest regards,\nNeuro IT Dispatch`)}`}
                                title="Send Email"
                                style={{
                                  padding: '0.35rem',
                                  background: 'var(--surface-secondary)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '4px',
                                  color: '#00D2FF',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Mail size={13} />
                              </a>

                              {/* WhatsApp Quick-Link */}
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${formatWhatsApp(lead.phone)}?text=${encodeURIComponent(`Hi, we received your inquiry for Neuro IT support in postcode ${lead.postcode}. How can we assist you today?`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Customer"
                                  style={{
                                    padding: '0.35rem',
                                    background: 'rgba(37, 211, 102, 0.05)',
                                    border: '1px solid rgba(37, 211, 102, 0.15)',
                                    borderRadius: '4px',
                                    color: '#25D366',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <MessageSquare size={13} />
                                </a>
                              )}

                              {/* Delete Action */}
                              <button
                                onClick={() => handleDelete(lead.id)}
                                disabled={deletingId === lead.id}
                                title="Delete Lead"
                                style={{
                                  padding: '0.35rem',
                                  background: 'rgba(239, 68, 68, 0.05)',
                                  border: '1px solid rgba(239, 68, 68, 0.15)',
                                  borderRadius: '4px',
                                  color: '#EF4444',
                                  cursor: deletingId === lead.id ? 'default' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
