'use client'

import Link from 'next/link'
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle, Wrench, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CREATED: { label: 'Created', color: 'var(--text-muted)' },
  DIAGNOSING: { label: 'Diagnosing', color: '#F59E0B' },
  CONFIRMED: { label: 'Confirmed', color: '#00D2FF' },
  TECH_ASSIGNED: { label: 'Tech Assigned', color: '#00D2FF' },
  ON_THE_WAY: { label: 'On The Way', color: '#F59E0B' },
  REPAIRING: { label: 'Repairing', color: '#F59E0B' },
  COMPLETED: { label: 'Completed', color: '#22C55E' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444' },
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/tickets')
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
  }, [])

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false
    const matchesSearch =
      t.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
      (t.customer?.name || '').toLowerCase().includes(search.toLowerCase())
    if (search && !matchesSearch) return false
    return true
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#00D2FF' }}>Tickets</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem' }}>
            All Tickets
          </h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtered.length} tickets</span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference or customer..."
              style={{
                width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
                color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading tickets...</div>
        ) : (
          <>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Reference', 'Customer', 'Service', 'Status', 'Priority', 'Price', 'Date', ''].map(h => (
                      <th key={h} className="font-syne" style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ticket => {
                    const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.CREATED
                    return (
                      <tr key={ticket.id} style={{ borderBottom: '1px solid #1C1C1C', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#141414' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                      >
                        <td style={{ padding: '1rem' }}>
                          <span className="font-mono" style={{ color: '#00D2FF', fontSize: '0.85rem' }}>{ticket.referenceCode}</span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ticket.customer?.name || 'Guest'}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{ticket.service?.name || 'Diagnostic/Repair'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            display: 'inline-block', padding: '0.2rem 0.6rem',
                            background: `${status.color}15`, color: status.color,
                            fontSize: '0.75rem', fontWeight: 600, borderRadius: '2px',
                            fontFamily: 'var(--font-syne)',
                          }}>
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {ticket.priority === 'EMERGENCY' ? (
                            <span style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600 }}>⚡ Emergency</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Standard</span>
                          )}
                        </td>
                        <td className="font-mono" style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          £{ticket.estimatedPriceMin || 0}–£{ticket.estimatedPriceMax || 0}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <Link href={`/admin/tickets/${ticket.id}`} style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.85rem' }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                No tickets match your filters.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
