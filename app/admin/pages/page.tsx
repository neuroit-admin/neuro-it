'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, FileText, ArrowLeft, Save, Globe, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const FIELD_LABELS: Record<string, string> = {
  heroTitle: 'Hero Headline',
  heroSubtitle: 'Hero Subtext / Description',
  primaryCtaText: 'Primary Booking Button Text',
  whatsappCtaText: 'WhatsApp Button Text',
  title: 'Page Main Title',
  subtitle: 'Page Subtitle / Description',
  step1Title: 'Step 1 Title',
  step1Text: 'Step 1 Description',
  step2Title: 'Step 2 Title',
  step2Text: 'Step 2 Description',
  step3Title: 'Step 3 Title',
  step3Text: 'Step 3 Description',
  step4Title: 'Step 4 Title',
  step4Text: 'Step 4 Description',
}

export default function AdminPagesCms() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPage, setSelectedPage] = useState<any>(null)
  
  // Edit form states
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [sections, setSections] = useState<Record<string, string>>({})
  
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchPages = () => {
    setLoading(true)
    fetch('/api/admin/pages')
      .then(res => res.json())
      .then(data => {
        if (data.pages) {
          setPages(data.pages)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch pages:', err)
        setErrorMsg('Failed to load CMS pages.')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleSelectPage = (page: any) => {
    setSelectedPage(page)
    setMetaTitle(page.metaTitle || '')
    setMetaDescription(page.metaDescription || '')
    try {
      setSections(JSON.parse(page.sections || '{}'))
    } catch {
      setSections({})
    }
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleSectionValueChange = (key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPage.slug,
          metaTitle,
          metaDescription,
          sections,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update page')

      setSuccessMsg('Page content updated successfully.')
      
      // Update local pages list
      setPages(prev => prev.map(p => p.slug === selectedPage.slug ? data.page : p))
      setSelectedPage(data.page)

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error updating page.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>CMS Pages</span>
          </div>

          {selectedPage ? (
            // Editor view
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button
                  onClick={() => setSelectedPage(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
                    Edit Page: {selectedPage.title}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Slug: <span className="font-mono" style={{ color: '#00D2FF' }}>/{selectedPage.slug === 'home' ? '' : selectedPage.slug}</span>
                  </p>
                </div>
              </div>

              {successMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid #22C55E', color: '#22C55E', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  <CheckCircle size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* SEO Metatags Card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <Globe size={18} style={{ color: '#00D2FF' }} />
                    SEO Search Engine Settings
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Meta Title (SEO Title)</label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={e => setMetaTitle(e.target.value)}
                        placeholder="Page title displayed in Google search results"
                        style={{
                          width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Meta Description (SEO Description)</label>
                      <textarea
                        rows={3}
                        value={metaDescription}
                        onChange={e => setMetaDescription(e.target.value)}
                        placeholder="Page description snippet displayed in Google search results"
                        style={{
                          width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Page Content Card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <Settings size={18} style={{ color: '#00D2FF' }} />
                    Page Content Sections
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {Object.entries(sections).map(([key, val]) => {
                      const label = FIELD_LABELS[key] || key
                      const isLongText = val.length > 50 || key.toLowerCase().includes('text') || key.toLowerCase().includes('subtitle') || key.toLowerCase().includes('desc')
                      
                      return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {label} <span className="font-mono" style={{ color: '#555', fontSize: '0.75rem', fontWeight: 400 }}>({key})</span>
                          </label>
                          
                          {isLongText ? (
                            <textarea
                              rows={3}
                              value={val}
                              onChange={e => handleSectionValueChange(key, e.target.value)}
                              style={{
                                width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                                borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                              }}
                            />
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={e => handleSectionValueChange(key, e.target.value)}
                              style={{
                                width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                                borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPage(null)}
                    style={{
                      padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #444',
                      borderRadius: '2px', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 2rem', background: '#00D2FF', border: 'none',
                      borderRadius: '2px', color: 'var(--bg-color)', fontSize: '0.9rem', fontWeight: 700,
                      cursor: 'pointer', opacity: saving ? 0.7 : 1
                    }}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Page Content'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Pages list view
            <div>
              <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
                  Website Content Management (CMS)
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Edit metadata, headlines, call-to-actions, and main text sections across different pages.
                </p>
              </div>

              {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading website pages...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {pages.map(page => (
                    <div
                      key={page.id}
                      style={{
                        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                        padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        transition: 'border-color 0.2s', minHeight: '180px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#00D2FF' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ width: '36px', height: '36px', background: 'rgba(0,210,255,0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D2FF' }}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{page.title}</h3>
                            <span className="font-mono" style={{ color: '#555', fontSize: '0.75rem' }}>/{page.slug === 'home' ? '' : page.slug}</span>
                          </div>
                        </div>

                        {page.metaDescription && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '3.6rem', marginBottom: '1rem' }}>
                            {page.metaDescription}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelectPage(page)}
                        style={{
                          width: '100%', padding: '0.6rem', background: 'var(--surface-secondary)',
                          border: '1px solid #333', borderRadius: '2px', color: 'var(--text-primary)',
                          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#00D2FF'
                          e.currentTarget.style.color = 'var(--bg-color)'
                          e.currentTarget.style.borderColor = '#00D2FF'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                          e.currentTarget.style.color = '#FFF'
                          e.currentTarget.style.borderColor = '#333'
                        }}
                      >
                        Edit Page Content
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
