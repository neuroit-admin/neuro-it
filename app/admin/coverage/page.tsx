'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, HelpCircle } from 'lucide-react'

interface Borough {
  id: string
  name: string
  slug: string
  zone: 'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'
  lat: number
  lng: number
  postcodes: string
  isActive: boolean
}

export default function AdminCoveragePage() {
  const [boroughs, setBoroughs] = useState<Borough[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentBorough, setCurrentBorough] = useState<Borough | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [zone, setZone] = useState<'FREE_CALL_OUT' | 'STANDARD_999' | 'LONDON_FLEX'>('FREE_CALL_OUT')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [postcodes, setPostcodes] = useState('')
  const [isActive, setIsActive] = useState(true)
  
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch boroughs
  const fetchBoroughs = () => {
    setLoading(true)
    fetch('/api/admin/coverage-boroughs')
      .then(res => res.json())
      .then(data => {
        if (data.boroughs) {
          setBoroughs(data.boroughs)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Fetch boroughs error:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBoroughs()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (!showEditModal) {
      const cleanSlug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setSlug(cleanSlug)
    }
  }, [name, showEditModal])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name || !slug || !lat || !lng || !postcodes) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    try {
      const res = await fetch('/api/admin/coverage-boroughs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          zone,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          postcodes,
          isActive
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create borough.')
      } else {
        setSuccessMsg('Borough created successfully!')
        setShowAddModal(false)
        resetForm()
        fetchBoroughs()
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to create borough.')
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBorough) return
    setErrorMsg('')
    setSuccessMsg('')

    if (!name || !slug || !lat || !lng || !postcodes) {
      setErrorMsg('Please fill in all required fields.')
      return
    }

    try {
      const res = await fetch(`/api/admin/coverage-boroughs/${currentBorough.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          zone,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          postcodes,
          isActive
        })
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update borough.')
      } else {
        setSuccessMsg('Borough updated successfully!')
        setShowEditModal(false)
        resetForm()
        fetchBoroughs()
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to update borough.')
    }
  }

  const handleToggleActive = async (borough: Borough) => {
    try {
      const res = await fetch(`/api/admin/coverage-boroughs/${borough.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !borough.isActive })
      })
      if (res.ok) {
        setBoroughs(prev =>
          prev.map(b => (b.id === borough.id ? { ...b, isActive: !b.isActive } : b))
        )
      }
    } catch (err) {
      console.error('Toggle status error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this borough? This action cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/admin/coverage-boroughs/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSuccessMsg('Borough deleted successfully.')
        fetchBoroughs()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Failed to delete.')
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to delete.')
    }
  }

  const openEditModal = (borough: Borough) => {
    setCurrentBorough(borough)
    setName(borough.name)
    setSlug(borough.slug)
    setZone(borough.zone)
    setLat(borough.lat.toString())
    setLng(borough.lng.toString())
    setPostcodes(borough.postcodes)
    setIsActive(borough.isActive)
    setShowEditModal(true)
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setZone('FREE_CALL_OUT')
    setLat('')
    setLng('')
    setPostcodes('')
    setIsActive(true)
    setCurrentBorough(null)
  }

  const filtered = boroughs.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.postcodes.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains)' }}>
                ADMIN SETTINGS
              </span>
              <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2.2rem', marginTop: '0.25rem' }}>
                Manage Operating Areas (CMS)
              </h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#00D2FF',
                color: 'var(--bg-color)',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-syne)',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={16} /> Add Borough
            </button>
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
              placeholder="Search borough by name or postcode..."
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

          {/* Main Content Table */}
          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '3rem 0', fontFamily: 'var(--font-syne)' }}>Loading coverage records...</div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Borough Name</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Slug</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Operating Zone</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Coordinates (Lat, Lng)</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Postcode Prefixes</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#555', fontFamily: 'var(--font-jetbrains)', fontSize: '0.9rem' }}>
                          No coverage boroughs found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(borough => (
                        <tr key={borough.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: borough.isActive ? 'transparent' : 'rgba(255,255,255,0.01)', opacity: borough.isActive ? 1 : 0.6 }}>
                          <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{borough.name}</td>
                          <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains)', fontSize: '0.75rem' }}>{borough.slug}</td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-jetbrains)',
                              fontWeight: 700,
                              background: borough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.1)' : borough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: borough.zone === 'FREE_CALL_OUT' ? '#00D2FF' : borough.zone === 'STANDARD_999' ? '#A855F7' : '#F59E0B',
                              border: `1px solid ${borough.zone === 'FREE_CALL_OUT' ? 'rgba(0, 210, 255, 0.2)' : borough.zone === 'STANDARD_999' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                            }}>
                              {borough.zone === 'FREE_CALL_OUT' ? '£10.00 Free Hub' : borough.zone === 'STANDARD_999' ? '£15.00 Standard' : 'Flexible Zone'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#AAA', fontFamily: 'var(--font-jetbrains)', fontSize: '0.75rem' }}>
                            {borough.lat.toFixed(4)}, {borough.lng.toFixed(4)}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#DDD', fontSize: '0.82rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {borough.postcodes.split(',').join(', ')}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(borough)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: borough.isActive ? '#22C55E' : '#EF4444',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                            >
                              {borough.isActive ? (
                                <>
                                  <CheckCircle2 size={14} /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} /> Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEditModal(borough)}
                                style={{
                                  padding: '0.35rem',
                                  background: 'var(--surface-secondary)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '4px',
                                  color: '#00D2FF',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(borough.id)}
                                style={{
                                  padding: '0.35rem',
                                  background: 'rgba(239, 68, 68, 0.05)',
                                  border: '1px solid rgba(239, 68, 68, 0.15)',
                                  borderRadius: '4px',
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
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

          {/* Add / Edit Borough Modal overlays */}
          {(showAddModal || showEditModal) && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}>
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                  {showAddModal ? 'Add Coverage Area' : 'Edit Coverage Area'}
                </h3>
                
                <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Borough Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Enfield"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Slug (Unique URL identifier)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. enfield"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      disabled={showEditModal} // Cannot change slug on edit to prevent routing breaks
                      style={{ width: '100%', background: showEditModal ? 'var(--surface)' : 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: showEditModal ? 'not-allowed' : 'text' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Operating Zone</label>
                      <select
                        value={zone}
                        onChange={e => setZone(e.target.value as any)}
                        style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                      >
                        <option value="FREE_CALL_OUT">£10.00 Free Hub (Zone 4)</option>
                        <option value="STANDARD_999">£15.00 Standard (Zone 3)</option>
                        <option value="LONDON_FLEX">Flexible (Zone 2)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Status</label>
                      <select
                        value={isActive ? 'ACTIVE' : 'INACTIVE'}
                        onChange={e => setIsActive(e.target.value === 'ACTIVE')}
                        style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g. 51.6522"
                        value={lat}
                        onChange={e => setLat(e.target.value)}
                        style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        placeholder="e.g. -0.0808"
                        value={lng}
                        onChange={e => setLng(e.target.value)}
                        style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      <span>Postcode Prefixes</span>
                      <span style={{ textTransform: 'none', color: '#555', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <HelpCircle size={10} /> Comma-separated (e.g. EN1,EN2)
                      </span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. EN1,EN2,EN3,N14"
                      value={postcodes}
                      onChange={e => setPostcodes(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.65rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', letterSpacing: '0.05em' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm() }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                        padding: '0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        background: '#00D2FF',
                        color: 'var(--bg-color)',
                        border: 'none',
                        padding: '0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-syne)',
                      }}
                    >
                      Save Area
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
