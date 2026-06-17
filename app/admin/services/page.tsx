'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Laptop, Monitor, Code, Shield, Database, Wifi, MousePointer, Package, Apple, Zap, CheckCircle, XCircle, Plus, Pencil, Eye, EyeOff, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const ICON_MAP: Record<string, any> = {
  Laptop, Monitor, Code, Shield, Database, Wifi, MousePointer, Package, Apple, Zap,
}

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  
  // Selected category ID for adding
  const [targetCategoryId, setTargetCategoryId] = useState('')
  
  // Selected service for editing
  const [selectedService, setSelectedService] = useState<any>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formMinPrice, setFormMinPrice] = useState('')
  const [formMaxPrice, setFormMaxPrice] = useState('')
  const [formCallOutFee, setFormCallOutFee] = useState('0')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formIsEmergencyReady, setFormIsEmergencyReady] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchServices = () => {
    setLoading(true)
    fetch('/api/admin/services')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch services:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleOpenAddModal = (catId: string) => {
    setTargetCategoryId(catId)
    setFormName('')
    setFormMinPrice('')
    setFormMaxPrice('')
    setFormCallOutFee('0')
    setFormDescription('')
    setFormIsActive(true)
    setFormIsEmergencyReady(true)
    setErrorMsg('')
    setAddModalOpen(true)
  }

  const handleOpenEditModal = (svc: any) => {
    setSelectedService(svc)
    setFormName(svc.name || '')
    setFormMinPrice(svc.priceMin !== undefined ? String(svc.priceMin) : '')
    setFormMaxPrice(svc.priceMax !== undefined ? String(svc.priceMax) : '')
    setFormCallOutFee(svc.callOutFee !== undefined ? String(svc.callOutFee) : '0')
    setFormDescription(svc.description || '')
    setFormIsActive(svc.isActive !== false)
    setFormIsEmergencyReady(svc.isEmergencyReady !== false)
    setErrorMsg('')
    setEditModalOpen(true)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          categoryId: targetCategoryId,
          basePriceMin: parseFloat(formMinPrice) || 0,
          basePriceMax: parseFloat(formMaxPrice) || 0,
          callOutFee: parseFloat(formCallOutFee) || 0,
          description: formDescription,
          isActive: formIsActive,
          isEmergencyReady: formIsEmergencyReady,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create service')

      setAddModalOpen(false)
      fetchServices()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error creating service.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedService.id,
          name: formName,
          basePriceMin: parseFloat(formMinPrice) || 0,
          basePriceMax: parseFloat(formMaxPrice) || 0,
          callOutFee: parseFloat(formCallOutFee) || 0,
          description: formDescription,
          isActive: formIsActive,
          isEmergencyReady: formIsEmergencyReady,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update service')

      setEditModalOpen(false)
      fetchServices()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error updating service.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to toggle status')
      }
      fetchServices()
    } catch (err: any) {
      console.error('Toggle status error:', err)
      alert(err.message || 'Failed to toggle status.')
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>Services</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
              Service Catalog Management
            </h1>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {categories.reduce((acc, cat) => acc + (cat.services?.length || 0), 0)} Services across {categories.length} Categories
            </span>
          </div>

          {loading && categories.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading services...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {categories.map(cat => {
                const Icon = ICON_MAP[cat.icon] || Laptop
                return (
                  <div key={cat.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    {/* Category header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(0,210,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} style={{ color: '#00D2FF' }} />
                        </div>
                        <div>
                          <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{cat.name}</h2>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{cat.services?.length || 0} services</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {cat.isActive ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#22C55E', fontSize: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle size={12} /> Active Category
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>
                            <XCircle size={12} /> Inactive Category
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenAddModal(cat.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(0,210,255,0.1)',
                            border: '1px solid rgba(0,210,255,0.3)',
                            borderRadius: '2px',
                            color: '#00D2FF',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(0,210,255,0.2)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(0,210,255,0.1)'
                          }}
                        >
                          <Plus size={14} /> Add Service
                        </button>
                      </div>
                    </div>

                    {/* Services table/list */}
                    {(!cat.services || cat.services.length === 0) ? (
                      <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                        No services in this category. Click "Add Service" to create one.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #1C1C1C', background: 'var(--surface)' }}>
                              <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>SERVICE NAME</th>
                              <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PRICE RANGE</th>
                              <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CALL OUT</th>
                              <th style={{ textAlign: 'center', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EMERGENCY READY</th>
                              <th style={{ textAlign: 'center', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>STATUS</th>
                              <th style={{ textAlign: 'right', padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.services.map((svc: any) => (
                              <tr
                                key={svc.id}
                                style={{
                                  borderBottom: '1px solid #1C1C1C',
                                  background: svc.isActive ? 'transparent' : 'rgba(239,68,68,0.02)'
                                }}
                              >
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                  <div style={{ color: svc.isActive ? '#E0E0E0' : '#888', fontWeight: 600, fontSize: '0.9rem' }}>{svc.name}</div>
                                  {svc.description && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {svc.description}
                                    </div>
                                  )}
                                </td>
                                <td className="font-mono" style={{ padding: '1rem 1.5rem', color: svc.isActive ? '#FFF' : '#888', fontSize: '0.85rem', verticalAlign: 'middle' }}>
                                  £{svc.priceMin} – £{svc.priceMax}
                                </td>
                                <td className="font-mono" style={{ padding: '1rem 1.5rem', color: svc.isActive ? '#FFF' : '#888', fontSize: '0.85rem', verticalAlign: 'middle' }}>
                                  £{svc.callOutFee}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                  {svc.isEmergencyReady ? (
                                    <span style={{ color: '#F59E0B', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.5rem', borderRadius: '2px', fontWeight: 600 }}>Yes</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No</span>
                                  )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                  {svc.isActive ? (
                                    <span style={{ color: '#22C55E', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
                                  ) : (
                                    <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>Inactive</span>
                                  )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => handleOpenEditModal(svc)}
                                      title="Edit Service"
                                      style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '32px', height: '32px', background: 'var(--surface-secondary)',
                                        border: '1px solid #333', borderRadius: '4px', color: '#00D2FF',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleToggleActive(svc.id)}
                                      title={svc.isActive ? "Deactivate" : "Activate"}
                                      style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: '32px', height: '32px', background: 'var(--surface-secondary)',
                                        border: '1px solid #333', borderRadius: '4px',
                                        color: svc.isActive ? '#EF4444' : '#22C55E',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {svc.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Backdrop and Modals */}
        {(addModalOpen || editModalOpen) && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem'
            }}
          >
            {/* Modal Box */}
            <div
              style={{
                background: 'var(--surface)', border: '1px solid #333', borderRadius: '4px',
                width: '100%', maxWidth: '600px', overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>
                  {addModalOpen ? 'Add New Service' : 'Edit Service'}
                </h3>
                <button
                  onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {errorMsg && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Service Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Virus Clean & Health Check"
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                      borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Min Price (£)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formMinPrice}
                      onChange={e => setFormMinPrice(e.target.value)}
                      placeholder="49"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Max Price (£)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formMaxPrice}
                      onChange={e => setFormMaxPrice(e.target.value)}
                      placeholder="120"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Call Out Fee (£)</label>
                    <input
                      type="number"
                      min="0"
                      value={formCallOutFee}
                      onChange={e => setFormCallOutFee(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Enter service details, what is covered, etc."
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                      borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formIsEmergencyReady}
                      onChange={e => setFormIsEmergencyReady(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Emergency Ready Service
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={e => setFormIsActive(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Active (Publish to Booking Catalog)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => { setAddModalOpen(false); setEditModalOpen(false); }}
                    style={{
                      padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid #444',
                      borderRadius: '2px', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '0.6rem 1.5rem', background: '#00D2FF', border: 'none',
                      borderRadius: '2px', color: 'var(--bg-color)', fontSize: '0.85rem', fontWeight: 700,
                      cursor: 'pointer', opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
