'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Star, CheckCircle, XCircle } from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.reviews) {
          setReviews(data.reviews)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch reviews:', err)
        setLoading(false)
      })
  }, [])

  const handleModerate = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      })
      if (res.ok) {
        // Update local state to reflect the moderation action
        setReviews(prev =>
          prev.map(r => (r.id === id ? { ...r, isApproved: approve, isPublic: approve } : r))
        )
      }
    } catch (err) {
      console.error('Moderation action failed:', err)
    }
  }

  const avgRating = reviews.length
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : 0

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#00D2FF' }}>Reviews</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem' }}>Reviews</h1>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="font-syne" style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1.5rem' }}>{avgRating || '—'}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Avg Rating</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.5rem' }}>{reviews.length}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="font-syne" style={{ color: '#00D2FF', fontWeight: 800, fontSize: '1.5rem' }}>
                {reviews.filter(r => !r.isApproved).length}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading reviews...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                No reviews found in database.
              </div>
            ) : (
              reviews.map(review => (
                <div
                  key={review.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem',
                    borderLeft: review.isApproved ? '3px solid #22C55E' : '3px solid #F59E0B',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>{review.customerName}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {review.service} • {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={16} style={{ color: s <= review.rating ? '#F59E0B' : 'var(--border)' }} fill={s <= review.rating ? '#F59E0B' : 'none'} />
                        ))}
                      </div>
                      {review.isApproved ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#22C55E', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle size={12} /> Approved
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 600 }}>
                          <XCircle size={12} /> Pending Approval
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    &quot;{review.comment || 'No comment provided.'}&quot;
                  </p>
                  {!review.isApproved && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleModerate(review.id, true)}
                        style={{ padding: '0.5rem 1rem', background: '#22C55E', color: 'var(--bg-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.8rem' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(review.id, false)}
                        style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.8rem' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
