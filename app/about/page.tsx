import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'
import { Shield, Users, Award, CheckCircle } from 'lucide-react'
import { WARRANTY_TITLE, WARRANTY_TEXT } from '@/lib/constants/business'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Neuro IT — London Home IT Support',
  description: 'Learn about Neuro IT — London\'s trusted home IT support service. DBS-checked engineers, No Fix No Fee guarantee, same-day visits across all boroughs.',
  alternates: { canonical: 'https://neuroit.co.uk/about' },
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.05em' }}>
            <Link href="/" style={{ color: '#00D2FF', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span>About Us</span>
          </div>

          {/* Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-syne)' }}>
              Our Story
            </span>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              London&apos;s Trusted Home <span style={{ color: '#00D2FF' }}>IT Support</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              We started with a simple mission: to take the stress out of home technology. Today, we deliver certified, reliable, and same-day support across all London boroughs.
            </p>
          </div>

          {/* Core Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Users size={24} style={{ color: '#00D2FF' }} />
              </div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.75rem' }}>DBS-Checked Technicians</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every engineer in our network is fully background-checked, certified, and vetted to guarantee peace of mind during home visits.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Shield size={24} style={{ color: '#00D2FF' }} />
              </div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.75rem' }}>No Fix, No Fee Guarantee</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                If our diagnostics reveal that your issue cannot be resolved, you pay absolutely nothing for the repair attempt.
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Award size={24} style={{ color: '#00D2FF' }} />
              </div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.75rem' }}>{WARRANTY_TITLE}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                All repairs carry a comprehensive {WARRANTY_TEXT.toLowerCase()}. If the exact same fault recurs, we resolve it without additional costs.
              </p>
            </div>
          </div>

          {/* Extended Info Block */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem' }}>
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              Why Choose Neuro IT?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 className="font-syne" style={{ color: '#00D2FF', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Expertise You Can Trust</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Our team consists of veteran hardware technicians, networking specialists, and cybersecurity experts who have supported thousands of residential clients across London.
                </p>
              </div>
              <div>
                <h4 className="font-syne" style={{ color: '#00D2FF', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Customer-First Philosophy</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  No complex jargon, no hidden fees, and no surprise charges. We walk you through what failed, what needs replacing, and explain everything clearly.
                </p>
              </div>
            </div>

            {/* Trust stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              {[
                { value: '5,000+', label: 'Repairs completed' },
                { value: '98%', label: 'Customer satisfaction' },
                { value: 'Same day', label: 'Average arrival time' },
                { value: '£1M', label: 'Public liability cover' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div className="font-syne" style={{ color: '#00D2FF', fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meet Our Engineers Section */}
          <div style={{ marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-syne)' }}>
                Expert Team
              </span>
              <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '2rem', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
                Meet Our Certified Engineers
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                Every visit is handled by a background-vetted, certified specialist. We bring enterprise-level technical expertise directly to your home.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {[
                {
                  name: 'Alex Mercer',
                  role: 'Lead Hardware & Mac Specialist',
                  certifications: 'Apple ACMT / CompTIA A+ / Vetted DBS',
                  bio: 'Alex has over 12 years of experience in micro-soldering, liquid damage recovery, and component-level repairs for MacBooks, laptops, and custom gaming PCs.',
                  initials: 'AM',
                  avatarBg: 'linear-gradient(135deg, #00D2FF 0%, #0066CC 100%)',
                },
                {
                  name: 'Sarah Connor',
                  role: 'Network & Cybersecurity Architect',
                  certifications: 'Cisco CCNA / CompTIA Security+ / Vetted DBS',
                  bio: 'Sarah specializes in residential mesh WiFi optimization, router configuration, firewall deployments, and active malware or ransomware extraction.',
                  initials: 'SC',
                  avatarBg: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
                },
                {
                  name: 'David Chen',
                  role: 'Senior OS & Data Recovery Expert',
                  certifications: 'Microsoft MCSE / Certified Data Recovery / Vetted DBS',
                  bio: 'David manages complex migrations, cloud backups, and data rescue from physically failing hard drives, SSDs, and network-attached storage (NAS) devices.',
                  initials: 'DC',
                  avatarBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                },
              ].map((member, i) => (
                <div
                  key={i}
                  className="transition-all duration-300 hover:border-[#00D2FF] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,210,255,0.12)]"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  {/* Photo Placeholder - Swap with <img src="/path/to/photo.jpg" /> or Next.js <Image /> */}
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      background: member.avatarBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '2rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-syne)',
                      marginBottom: '1.5rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* To use image, uncomment this and set src: */}
                    {/* <img src={`/assets/team/${member.name.toLowerCase().replace(' ', '-')}.jpg`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
                    {member.initials}
                    
                    {/* DBS Badge overlay */}
                    <div
                      title="DBS Vetted & Certified"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#22C55E',
                        border: '2px solid var(--surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: 'white',
                        zIndex: 2,
                      }}
                    >
                      ✓
                    </div>
                  </div>

                  <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                    {member.name}
                  </h3>
                  <div style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'var(--font-jetbrains)' }}>
                    {member.role}
                  </div>
                  
                  {/* Certifications Badge */}
                  <div style={{ background: 'var(--surface-secondary)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                    🛡️ {member.certifications}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Office & Contact Info */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>Business Address</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                <strong>Neuro IT</strong><br />
                {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ'}<br />
                United Kingdom
              </p>
            </div>
            <div>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>Service Hours & Coverage</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Our mobile technicians cover all London boroughs.<br />
                <strong>Mon – Sun:</strong> 8:00 AM – 8:00 PM<br />
                <strong>Emergency dispatch:</strong> 24/7 hours available
              </p>
              <p style={{ color: '#00D2FF', fontSize: '0.9rem', fontWeight: 600, marginTop: '1rem', margin: 0 }}>
                📞 Telephone: {process.env.NEXT_PUBLIC_PHONE_NUMBER || '0200 000 0000'}
              </p>
            </div>
          </div>

          {/* CTA Section — was missing before */}
          <div style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, transparent 100%)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center' }}>
            <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '1rem' }}>
              Ready to Get Your Tech Sorted?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Book a certified DBS-checked engineer to your home today. Same-day availability across all London boroughs.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/book"
                style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#00D2FF', color: 'var(--bg-color)', textDecoration: 'none', fontWeight: 700, fontFamily: 'var(--font-syne)', fontSize: '0.95rem', borderRadius: '4px', letterSpacing: '0.04em' }}
              >
                Book a Repair
              </Link>
              <Link
                href="/services"
                style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--font-syne)', fontSize: '0.95rem', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                View All Services
              </Link>
            </div>

            {/* Quick trust reassurance */}
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
              {['DBS-Checked Engineers', 'No Fix, No Fee', WARRANTY_TITLE].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <CheckCircle size={14} style={{ color: '#22C55E' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
