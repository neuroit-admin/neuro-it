'use client'

import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { Ticket, Users, Star, TrendingUp, Settings, Wrench, FileText, MapPin, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

const ICON_MAP: Record<string, any> = {
  'Total Tickets': Ticket,
  'Open Tickets': TrendingUp,
  'Revenue': TrendingUp,
  'Avg Rating': Star,
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: '#888888',
  CONFIRMED: '#00D2FF',
  TECH_ASSIGNED: '#00D2FF',
  ON_THE_WAY: '#F59E0B',
  REPAIRING: '#F59E0B',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats)
        if (data.recentTickets) setRecentTickets(data.recentTickets)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch analytics:', err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '72px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', marginBottom: '0.25rem' }}>
                Admin Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>Welcome back. Here&apos;s what&apos;s happening.</p>
            </div>
            <Link
              href="/book"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#00D2FF',
                color: 'var(--bg-color)',
                textDecoration: 'none',
                fontWeight: 700,
                fontFamily: 'var(--font-syne)',
                fontSize: '0.9rem',
                borderRadius: '2px',
              }}
            >
              + New Ticket
            </Link>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading dashboard analytics...</div>
          ) : (
            <>
              {/* Stats grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                }}
              >
                {stats.map(({ label, value, change, color }) => {
                  const Icon = ICON_MAP[label] || Ticket
                  return (
                    <div
                      key={label}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '1.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={20} style={{ color }} />
                        </div>
                        <span style={{ color: '#22C55E', fontSize: '0.75rem', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
                          {change}
                        </span>
                      </div>
                      <p className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{value}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</p>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Recent tickets */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Recent Tickets</h2>
                    <Link href="/admin/tickets" style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.85rem' }}>
                      View All →
                    </Link>
                  </div>
                  <div>
                    {recentTickets.map(ticket => (
                      <Link
                        key={ticket.id}
                        href={`/admin/tickets/${ticket.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem 1.5rem',
                          borderBottom: '1px solid var(--border)',
                          textDecoration: 'none',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <p className="font-mono" style={{ color: '#00D2FF', fontSize: '0.75rem' }}>{ticket.ref}</p>
                          <p className="font-syne" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {ticket.customer}
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ticket.service}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              background: `${STATUS_COLORS[ticket.status]}20`,
                              color: STATUS_COLORS[ticket.status],
                              borderRadius: '2px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-syne)',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {(ticket.status || 'CREATED').replace('_', ' ')}
                          </span>
                          {ticket.priority === 'EMERGENCY' && (
                            <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: 600 }}>⚡ EMERGENCY</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { href: '/admin/tickets', label: 'All Tickets', icon: Ticket },
                    { href: '/admin/customers', label: 'Customers', icon: Users },
                    { href: '/admin/reviews', label: 'Reviews', icon: Star },
                    { href: '/admin/services', label: 'Manage Services', icon: Wrench },
                    { href: '/admin/pages', label: 'Manage Pages (CMS)', icon: FileText },
                    { href: '/admin/blog', label: 'Manage Blog', icon: FileText },
                    { href: '/admin/coverage', label: 'Manage Areas', icon: MapPin },
                    { href: '/admin/leads', label: 'Postcode Leads', icon: Mail },
                    { href: '/admin/settings', label: 'System Settings', icon: Settings },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1.25rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-syne)',
                        fontWeight: 600,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#00D2FF' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)' }}
                    >
                      <Icon size={18} style={{ color: '#00D2FF' }} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
