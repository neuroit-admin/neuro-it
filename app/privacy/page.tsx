import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Neuro IT',
  description: 'Neuro IT Privacy Policy. How we collect, use, and protect your personal data under UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#0A0A0A', paddingTop: '72px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem' }}>Last updated: June 2026</p>

          {[
            {
              title: '1. Who We Are',
              body: 'Neuro IT ("we", "us", "our") is a London-based IT support service. We act as the Data Controller for any personal data you provide, ensuring compliance with UK GDPR and data protection laws.',
            },
            {
              title: '2. Data We Collect',
              body: 'We collect the following personal data when you use our service:\n• Name and email address\n• Home address and postcode\n• Device information (brand, model, OS)\n• Issue descriptions and chat transcripts\n• Device photographs (for condition verification in Mail-in repairs)\n• Payment details (processed securely via Stripe)\n• Cookies and website analytics data',
            },
            {
              title: '3. How We Use Your Data',
              body: 'We use your data to:\n• Provide IT support services\n• Process bookings and payments\n• Communicate with you about your repair\n• Improve our service and website\n• Comply with legal obligations',
            },
            {
              title: '4. Legal Basis',
              body: 'We process your data under the following legal bases:\n• Contract: to fulfill our service agreement with you\n• Legitimate interest: to improve our service\n• Consent: for marketing communications\n• Legal obligation: for financial records and tax compliance',
            },
            {
              title: '5. Data Retention',
              body: 'We retain your personal data for the minimum period necessary:\n• Active account data: duration of your account\n• Completed repair records: 6 years (UK tax requirements)\n• Chat transcripts: 12 months\n• Device photographs: 90 days following repair completion (held for condition verification and insurance purposes)\n• Payment records: 7 years (financial regulations)',
            },
            {
              title: '6. Your Rights',
              body: 'Under UK GDPR you have the right to:\n• Access your personal data\n• Rectify inaccurate data\n• Erase your data ("right to be forgotten")\n• Object to processing\n• Data portability\n• Withdraw consent\n\nTo exercise these rights, email privacy@neuroit.co.uk or use the data export/delete features in your account portal.',
            },
            {
              title: '7. Data Security',
              body: 'We implement appropriate technical and organisational measures to protect your data, including encryption in transit (TLS), secure database storage, and access controls.',
            },
            {
              title: '8. Third Parties',
              body: 'We share data with:\n• Stripe (payment processing)\n• Google (authentication)\n• Resend (transactional emails)\n\nAll third parties are GDPR-compliant and process data only as necessary.',
            },
            {
              title: '9. Contact',
              body: 'For privacy enquiries:\nEmail: privacy@neuroit.co.uk\nYou may also contact the Information Commissioner\'s Office (ICO) at ico.org.uk if you have data protection concerns.',
            },
          ].map(({ title, body }) => (
            <section key={title} style={{ marginBottom: '2.5rem' }}>
              <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                {title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
