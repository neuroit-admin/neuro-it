'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChevronRight, User, Mail, Phone, Ticket, MapPin } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  CREATED: '#888', DIAGNOSING: '#F59E0B', CONFIRMED: '#00D2FF', TECH_ASSIGNED: '#00D2FF',
  ON_THE_WAY: '#F59E0B', REPAIRING: '#F59E0B', COMPLETED: '#22C55E', CANCELLED: '#EF4444',
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/customers/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.customer) {
            setCustomer(data.customer)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch customer profile:', err)
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
          Loading customer profile...
        </div>
      </main>
    )
  }

  if (!customer) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
          Customer not found. <Link href="/admin/customers" style={{ color: '#00D2FF' }}>Go back</Link>
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
          <Link href="/admin/customers" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Customers</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#00D2FF' }}>{customer.name || 'Customer'}</span>
        </div>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.25rem' }}>{customer.name || 'Unnamed'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Customer since {new Date(customer.joined).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: <Mail size={16} style={{ color: '#00D2FF' }} />, label: 'Email', value: customer.email || 'No email' },
            { icon: <Phone size={16} style={{ color: '#00D2FF' }} />, label: 'Phone', value: customer.phone || '—' },
            { icon: <Ticket size={16} style={{ color: '#00D2FF' }} />, label: 'Total Tickets', value: `${customer.tickets?.length || 0}` },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {item.icon}
                <span className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>{item.label.toUpperCase()}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Addresses */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>ADDRESSES</h2>
          {(!customer.addresses || customer.addresses.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No addresses stored.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customer.addresses.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={16} style={{ color: '#00D2FF', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {a.houseNumber} {a.addressLine1}, {a.city}, {a.postcode}
                    </p>
                    {a.isDefault && <span style={{ color: '#00D2FF', fontSize: '0.75rem', fontWeight: 600 }}>Default Address</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket History */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
          <h2 className="font-syne" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem' }}>TICKET HISTORY</h2>
          {(!customer.tickets || customer.tickets.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No ticket history.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {customer.tickets.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '4px', textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#222' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-secondary)' }}
                >
                  <div>
                    <p className="font-mono" style={{ color: '#00D2FF', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{t.referenceCode}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.service}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: STATUS_COLORS[t.status] || '#888', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-syne)' }}>
                      {(t.status || 'CREATED').replace(/_/g, ' ')}
                    </span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
