'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

// Static reviews for development
const MOCK_REVIEWS = [
  { name: 'James T.', rating: 5, text: 'Incredible service! My laptop was fixed within 2 hours. Highly professional and friendly technician.' },
  { name: 'Sarah M.', rating: 5, text: 'Booked via the app and had a technician at my door the same afternoon. WiFi problem sorted in 20 minutes.' },
  { name: 'David K.', rating: 5, text: 'Removed a nasty virus from my PC. Really thorough and explained everything clearly. Will use again.' },
  { name: 'Emma R.', rating: 5, text: 'Set up my new MacBook exactly how I wanted. Transferred all my files perfectly. Excellent value.' },
  { name: 'Tom B.', rating: 5, text: 'Emergency call on a Sunday — technician arrived within the hour. Fixed my screen. Absolute lifesaver!' },
  { name: 'Lisa P.', rating: 5, text: 'DBS checked and very trustworthy. Came to my home and sorted everything professionally.' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          style={{
            fill: i < rating ? '#F59E0B' : 'transparent',
            color: i < rating ? '#F59E0B' : 'var(--border)',
          }}
        />
      ))}
    </div>
  )
}

export default function ReviewsCarousel() {
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section
      id="reviews"
      style={{ background: 'var(--bg-color)', padding: '5rem 0', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            className="font-syne"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}
          >
            What Our Customers Say
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <StarRating rating={5} />
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>5.0</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>from 200+ reviews</span>
          </div>
        </div>
      </div>

      {/* Scrolling carousel */}
      <div
        style={{
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gradient masks */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '120px',
            background: 'linear-gradient(to right, var(--bg-color), transparent)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '120px',
            background: 'linear-gradient(to left, var(--bg-color), transparent)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            padding: '0 1.5rem',
            animation: 'scroll-x 35s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false)
            setHoveredIdx(null)
          }}
        >
          {[...MOCK_REVIEWS, ...MOCK_REVIEWS].map((review, i) => {
            const isDimmed = hoveredIdx !== null && hoveredIdx !== i
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                style={{
                  minWidth: '320px',
                  maxWidth: '320px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  backdropFilter: 'blur(8px)',
                  border: hoveredIdx === i ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1.75rem 1.5rem',
                  flexShrink: 0,
                  opacity: isDimmed ? 0.45 : 1,
                  transform: hoveredIdx === i ? 'translateY(-4px) scale(1.02)' : 'none',
                  boxShadow: hoveredIdx === i ? '0 8px 32px rgba(0, 210, 255, 0.08)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <StarRating rating={review.rating} />
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    margin: '1rem 0',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>
                <p
                  className="font-syne"
                  style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  — {review.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
