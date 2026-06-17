'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Search, User } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => {
        if (data.customers) {
          setCustomers(data.customers)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err)
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#00D2FF' }}>Customers</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem' }}>Customers</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtered.length} customers</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            style={{
              width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px',
              color: 'var(--text-secondary)', fontSize: '0.9rem', outline: 'none',
            }}
          />
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading customers...</div>
        ) : (
          <>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Customer', 'Email', 'Phone', 'Tickets', 'Active', 'Joined', ''].map(h => (
                      <th key={h} className="font-syne" style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1C1C1C', transition: 'background 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#141414' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={16} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <span className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email || 'No Email'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.totalTickets}</td>
                      <td style={{ padding: '1rem' }}>
                        {c.activeTickets > 0 ? (
                          <span style={{ color: '#00D2FF', fontWeight: 600, fontSize: '0.85rem' }}>{c.activeTickets}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(c.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Link href={`/admin/customers/${c.id}`} style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.85rem' }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                No customers found matching your search.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
