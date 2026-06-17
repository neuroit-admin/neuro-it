import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Repair | Neuro IT',
  description: 'Enter your ticket reference code and email to track your repair status.',
  robots: 'noindex, nofollow',
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
