'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle, Wrench } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CREATED: { label: 'Request Created', color: 'var(--text-muted)', icon: <Clock size={16} /> },
  DIAGNOSING: { label: 'Diagnosing', color: '#F59E0B', icon: <AlertCircle size={16} /> },
  CONFIRMED: { label: 'Confirmed', color: '#00D2FF', icon: <CheckCircle size={16} /> },
  TECH_ASSIGNED: { label: 'Tech Assigned', color: '#00D2FF', icon: <CheckCircle size={16} /> },
  ON_THE_WAY: { label: 'On The Way', color: '#F59E0B', icon: <Clock size={16} /> },
  REPAIRING: { label: 'Repairing', color: '#F59E0B', icon: <Wrench size={16} /> },
  COMPLETED: { label: 'Completed', color: '#22C55E', icon: <CheckCircle size={16} /> },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', icon: <AlertCircle size={16} /> },
}

function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            height: '84px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '60%' }}>
            <div style={{ background: '#222222', height: '12px', borderRadius: '4px', width: '25%' }}></div>
            <div style={{ background: '#222222', height: '16px', borderRadius: '4px', width: '70%' }}></div>
            <div style={{ background: '#222222', height: '10px', borderRadius: '4px', width: '45%' }}></div>
          </div>
          <div style={{ background: '#222222', height: '18px', borderRadius: '4px', width: '20%' }}></div>
        </div>
      ))}
    </div>
  )
}

export default function PortalPage() {
  const { data: session, status } = useSession()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/tickets')
        .then(res => res.json())
        .then(data => {
          if (data.tickets) {
            setTickets(data.tickets)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch tickets:', err)
          setLoading(false)
        })
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const activeTickets = tickets.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status))
  const pastTickets = tickets.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status))
  const displayTickets = activeTab === 'active' ? activeTickets : pastTickets

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '72px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>
              My Portal
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Track your repairs and manage your account.</p>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Quick stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                }}
              >
                {[
                  { label: 'Total Repairs', value: tickets.length },
                  { label: 'Active Repairs', value: activeTickets.length },
                  { label: 'Completed', value: tickets.filter(t => t.status === 'COMPLETED').length },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '1.25rem',
                    }}
                  >
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-syne)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                      {label.toUpperCase()}
                    </p>
                    <p className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800 }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Book new */}
              <Link
                href="/book"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: '#00D2FF',
                  color: 'var(--bg-color)',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontFamily: 'var(--font-syne)',
                  fontSize: '0.9rem',
                  borderRadius: '2px',
                  marginBottom: '2.5rem',
                }}
              >
                + Book New Repair
              </Link>

              {tickets.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No repairs yet.</p>
                  <Link
                    href="/book"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#00D2FF',
                      color: 'var(--bg-color)',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontFamily: 'var(--font-syne)',
                      borderRadius: '2px',
                    }}
                  >
                    Book Your First Repair
                  </Link>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => setActiveTab('active')}
                      className="font-syne"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'active' ? '#00D2FF' : '#888888',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        position: 'relative',
                        transition: 'color 0.2s',
                        outline: 'none',
                      }}
                    >
                      Active Repairs ({activeTickets.length})
                      {activeTab === 'active' && (
                        <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: '#00D2FF' }}></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('past')}
                      className="font-syne"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'past' ? '#00D2FF' : '#888888',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        position: 'relative',
                        transition: 'color 0.2s',
                        outline: 'none',
                      }}
                    >
                      Past Repairs ({pastTickets.length})
                      {activeTab === 'past' && (
                        <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: '#00D2FF' }}></div>
                      )}
                    </button>
                  </div>

                  {displayTickets.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      No {activeTab} repairs found.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {displayTickets.map(ticket => {
                        const statusInfo = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.CREATED
                        return (
                          <Link
                            key={ticket.id}
                            href={`/portal/ticket/${ticket.id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1.25rem 1.5rem',
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              gap: '1rem',
                            }}
                            onMouseEnter={e => {
                              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#00D2FF'
                              ;(e.currentTarget as HTMLAnchorElement).style.background = '#141414'
                            }}
                            onMouseLeave={e => {
                              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                              ;(e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)'
                            }}
                          >
                            <div>
                              <p className="font-mono" style={{ color: '#00D2FF', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                {ticket.referenceCode}
                              </p>
                              <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {ticket.service?.name || 'Diagnostic/Repair'}
                              </p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: statusInfo.color }}>
                              {statusInfo.icon}
                              <span className="font-syne" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
