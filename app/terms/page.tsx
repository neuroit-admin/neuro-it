import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { WARRANTY_DAYS } from '@/lib/constants/business'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Neuro IT',
  description: 'Neuro IT Terms and Conditions for home IT support services in London.',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#0A0A0A', paddingTop: '72px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem' }}>Last updated: June 2026</p>

          {[
            {
              title: '1. Service Agreement',
              body: 'By booking a repair through Neuro IT, you agree to these terms. Our services are provided as described on our website and during the booking process. All prices are in GBP and include applicable surcharges.',
            },
            {
              title: '2. Pricing & Payment',
              body: 'Prices shown are estimates based on the information you provide. The final price is confirmed by the technician after diagnosis.\n• A 50% deposit is required at the time of booking (100% for emergency bookings)\n• The remaining balance is payable upon completion\n• Congestion Charge (£15.00, Mon-Fri 7am-6pm) applies where applicable\n• Call-out fees for emergency bookings are non-refundable once the technician is dispatched',
            },
            {
              title: '3. No Fix, No Fee Guarantee',
              body: 'If our technician is unable to resolve your issue, you will not be charged for the repair. This does not apply to:\n• Diagnostic fees where explicitly stated\n• Emergency call-out fees once a technician is dispatched\n• Situations where the customer refuses the recommended repair',
            },
            {
              title: '4. Cancellation Policy',
              body: 'You may cancel your booking:\n• More than 4 hours before the appointment: full refund of deposit\n• Less than 4 hours before: 50% of deposit retained\n• After technician dispatch: call-out fee is non-refundable\n\nUnder the Consumer Contracts Regulations 2013, you have a 14-day cooling-off period for remote purchases, except where the service has been fully performed.',
            },
            {
              title: '5. Warranty',
              body: `All repairs carry a ${WARRANTY_DAYS}-day warranty covering the same fault. This does not cover:\n• Physical damage after repair\n• Software issues unrelated to the original repair\n• Third-party hardware failure`,
            },
            {
              title: '6. Liability',
              body: 'We hold £1,000,000 public liability insurance. Our liability is limited to the cost of the repair service. We are not liable for pre-existing data loss, software corruption unrelated to our work, or consequential damages. For Mail-in repairs, our transit liability is strictly limited to the insurance coverage provided by the shipping carrier (up to £750 for standard prepaid Royal Mail Special Delivery labels), and we are not liable for items damaged in transit due to improper packaging by the customer.',
            },
            {
              title: '7. Your Responsibilities',
              body: 'You agree to:\n• Provide accurate information about your issue and device\n• Ensure safe access to your property for the technician\n• Back up important data before any repair (we are not liable for data loss)\n• Be present or arrange for someone over 18 to be present during the visit',
            },
            {
              title: '8. Technician Conduct',
              body: 'All our technicians are DBS-checked and insured. They will:\n• Show identification upon arrival\n• Treat your property with respect\n• Explain the diagnosis and any additional costs before proceeding',
            },
            {
              title: '9. Dispute Resolution',
              body: 'If you have a complaint, please contact us at neuroit.london@gmail.com. We aim to resolve all complaints within 5 working days. If we cannot reach a resolution, you may refer the matter to an Alternative Dispute Resolution (ADR) provider.',
            },
            {
              title: '10. Governing Law',
              body: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
            },
            {
              title: '11. Mail-in & Drop-off Logistics & SLAs',
              body: '• Diagnostics & Repairs: Diagnostics and repairs are completed within 3–5 business days of device receipt at our workshop.\n• Drop-off Schedule: Customers dropping off devices must book an appointment slot. Cancellations or rescheduling of drop-off slots must be done at least 2 hours prior to the appointment. Unscheduled drop-offs may experience significant delays.\n• Return Delivery: Repaired devices are returned via Royal Mail Special Delivery within 24 hours of successful payment confirmation.\n• Storage Fees: Unclaimed or unpaid devices left at our workshop for more than 60 days following repair completion notification may be disposed of to recover diagnostics and storage costs.',
            },
            {
              title: '12. Out-of-Area Lead Processing',
              body: 'If you request service outside our operating boundaries, your contact information (Lead) is processed to evaluate custom service quotes. You consent to our dispatch team contacting you via email or phone to negotiate travel fees and dispatch review.',
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
