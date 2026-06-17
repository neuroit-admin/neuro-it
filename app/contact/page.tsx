import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Neuro IT | London Home IT Support & Tech Repair',
  description:
    'Get in touch with Neuro IT. Contact our London dispatchers via WhatsApp, phone, email, or fill out our online contact form for rapid home IT support & device repairs.',
  openGraph: {
    title: 'Contact Neuro IT | London Home IT Support & Tech Repair',
    description:
      'Get in touch with Neuro IT. Contact our London dispatchers via WhatsApp, phone, email, or fill out our online contact form for rapid home IT support & device repairs.',
    url: 'https://neuro-it.co.uk/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://neuro-it.co.uk/contact',
  },
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <ContactClient />
      </main>
      <Footer />
    </>
  )
}
