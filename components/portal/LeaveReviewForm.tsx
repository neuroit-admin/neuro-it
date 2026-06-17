'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  ticketId: string
  token?: string
}

export default function LeaveReviewForm({ ticketId, token }: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setErrorMsg('Please select a rating of 1 to 5 stars.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          rating,
          comment: comment.trim() || null,
          token: token || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setIsSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '4px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#22C55E',
          }}
        >
          ✓
        </div>
        <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.5rem' }}>
          Thank You for Your Review!
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
          Your rating and feedback have been recorded. Once approved by our team, it will appear on our homepage.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '2rem 1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        How did we do?
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.4 }}>
        Your review helps us maintain quality and assists future customers.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Star Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isStarred = (hoverRating || rating) >= star
            return (
              <button
                key={star}
                type="button"
                onClick={() => { setRating(star); setErrorMsg('') }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  outline: 'none',
                  transition: 'transform 0.15s ease',
                }}
                className="hover:scale-110 active:scale-95"
                aria-label={`Rate ${star} Stars`}
              >
                <Star
                  size={32}
                  style={{
                    color: isStarred ? '#F59E0B' : 'var(--border)',
                    fill: isStarred ? '#F59E0B' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* Comment Input */}
        <div>
          <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>
            Share Your Experience (Optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="e.g. Excellent service! The technician arrived right on time and replaced my laptop screen in under 30 minutes. Highly recommended!"
            rows={3}
            maxLength={1000}
            style={{
              width: '100%',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {errorMsg && (
          <p style={{ color: '#EF4444', fontSize: '0.8rem', margin: 0, padding: '0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: '4px' }}>
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: rating > 0 && !isSubmitting ? '#F59E0B' : 'var(--surface-secondary)',
            color: rating > 0 && !isSubmitting ? 'var(--bg-color)' : '#888888',
            border: 'none',
            borderRadius: '4px',
            cursor: rating > 0 && !isSubmitting ? 'pointer' : 'default',
            fontWeight: 700,
            fontSize: '0.9rem',
            fontFamily: 'var(--font-syne)',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
