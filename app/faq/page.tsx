import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FaqClient from './FaqClient'
import { WARRANTY_DAYS } from '@/lib/constants/business'

export const metadata: Metadata = {
  title: 'FAQ | Neuro IT London — Home IT Support Questions Answered',
  description:
    'Answers to common questions about Neuro IT home IT repair services in London. Call-out fees, warranties, payment methods, DBS-checked engineers, and same-day availability.',
  openGraph: {
    title: 'FAQ | Neuro IT London — Home IT Support Questions Answered',
    description:
      'Quick answers about our London home IT repair services. Same-day visits, No Fix No Fee, DBS-checked technicians.',
    url: 'https://neuroit.co.uk/faq',
    type: 'website',
  },
  alternates: {
    canonical: 'https://neuroit.co.uk/faq',
  },
}

// FAQ data — shared between JSON-LD schema and client component
const faqs = [
  {
    q: 'How quickly can an IT technician arrive?',
    a: 'We offer same-day appointments across our London coverage area. In most cases, a technician can be at your door within 2 to 4 hours of booking, depending on engineer availability.',
  },
  {
    q: 'Do you charge a call-out fee?',
    a: 'We do not charge call-out fees for standard diagnostics. However, emergency or out-of-hours bookings carry a call-out fee which is transparently shown during booking and is non-refundable once the engineer is dispatched.',
  },
  {
    q: 'Do you require a booking deposit?',
    a: 'To secure your booking slot and protect against no-shows, standard bookings in our coverage areas require a booking deposit (£10.00 for Zone 4 - which is fully deducted from your final repair invoice, or £15.00 for Zone 3). Out-of-zone bookings require £0 deposit and call-out travel fees are negotiated.',
  },
  {
    q: 'Do you have a "No Fix, No Fee" guarantee?',
    a: 'Yes, if our technician diagnoses your device and determines that it cannot be fixed, you do not pay any repair fee. This guarantee does not apply to diagnostic-only requests or situations where recommendation is refused.',
  },
  {
    q: 'Do you cover ULEZ and Congestion Charge zones?',
    a: 'We serve all of London. ULEZ zone surcharges are completely free and not charged to customers. However, standard TfL Congestion Charges (£15.00) apply to bookings located inside central London congestion areas (Mon-Fri, 7am-6pm).',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We take standard credit/debit cards, Apple Pay, Google Pay, and cash. Deposits are secured online via Stripe, and the remaining balance is paid directly to the technician once the work is successfully completed.',
  },
  {
    q: 'Are your technicians insured and background checked?',
    a: 'Yes, all Neuro IT technicians are fully DBS-checked, vetted, and carry £1,000,000 in public liability insurance for maximum security and peace of mind during home visits.',
  },
  {
    q: 'What warranty is provided on repairs?',
    a: `All repairs come with a standard ${WARRANTY_DAYS}-day warranty. If the exact same fault recurs within ${WARRANTY_DAYS} days due to our repair workmanship, we will send an engineer to resolve it again at no extra cost.`,
  },
  {
    q: 'Do you offer remote IT support?',
    a: 'Yes, for software, virus cleanup, email setup, and configuration issues, we offer remote screen-share support. You can select this option during the booking flow.',
  },
]

// Generate FAQPage JSON-LD structured data for Google rich results
function generateFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export default function FaqPage() {
  const faqSchema = generateFaqSchema()

  return (
    <>
      {/* FAQPage structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <FaqClient faqs={faqs} />
      </main>
      <Footer />
    </>
  )
}
