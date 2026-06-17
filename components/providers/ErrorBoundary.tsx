// =============================================================================
// Neuro IT — Global Error Boundary
// Catches component-level crashes before they take down the whole page.
// Shows a friendly fallback UI with a WhatsApp escape hatch.
// =============================================================================
'use client'

import React from 'react'

interface State { hasError: boolean; errorId: string | null }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, errorId: null }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: crypto.randomUUID().slice(0, 8).toUpperCase() }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Send to your logging service (e.g. Sentry) here
    console.error('[Neuro IT] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const wa = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '447700000000'}?text=${encodeURIComponent('Hi, I hit an error on your website (ref: ' + this.state.errorId + ')')}`

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.75rem', color: '#EF4444', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            ERROR · REF: {this.state.errorId}
          </div>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We apologise for the inconvenience. Our team has been notified. You can try refreshing the page or contact us directly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => this.setState({ hasError: false, errorId: null })}
              style={{ padding: '0.875rem 1.75rem', background: '#00D2FF', color: 'var(--bg-color)', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-syne)' }}
            >
              Try Again
            </button>
            <a href={wa} target="_blank" rel="noopener noreferrer" style={{ padding: '0.875rem 1.75rem', background: 'transparent', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '4px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-syne)' }}>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    )
  }
}
