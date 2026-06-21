'use client'

import Link from 'next/link'
import { MessageCircle, Mail, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import TrackForm from './TrackForm'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [whatsappNumber, setWhatsappNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '447519460614')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.whatsapp_number) {
          setWhatsappNumber(data.settings.whatsapp_number)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    services: false,
    areas: false,
    company: false,
    contact: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <footer
      style={{
        background: 'var(--bg-color)',
        borderTop: '1px solid var(--border)',
      }}
      className="footer-container"
    >
      {/* Accordion styling for mobile and desktop */}
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-container {
          padding: 2rem 1.25rem 2.5rem;
        }
        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .footer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
        }
        .footer-chevron {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @media (max-width: 767px) {
          .footer-header {
            cursor: pointer;
            border-bottom: 1px solid var(--border);
            padding: 0.6rem 0;
            margin-bottom: 0 !important;
          }
          .footer-list {
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out, margin-top 0.3s;
            margin-top: 0;
          }
          .footer-list.open {
            max-height: 450px;
            opacity: 1;
            margin-top: 0.5rem;
            padding-bottom: 0.75rem;
          }
        }
        @media (min-width: 768px) {
          .footer-container {
            padding: 3rem 1.5rem 3rem;
          }
          .footer-list {
            max-height: none !important;
            opacity: 1 !important;
          }
          .footer-chevron {
            display: none !important;
          }
        }
      ` }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Brand */}
          <div>
            <div
              className="font-syne"
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                marginBottom: '0.75rem',
                color: 'var(--text-primary)',
              }}
            >
              NEURO<span style={{ color: '#00D2FF' }}>IT</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              London&apos;s smartest home IT support. At your door, fixed fast.
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 className="font-syne" style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>TRACK REPAIR ORDER</h4>
              <TrackForm variant="compact" />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#22C55E',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <Link
                href="/contact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
              >
                <Mail size={16} /> Email Us
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3
              onClick={() => toggleSection('services')}
              className="font-syne footer-header"
            >
              SERVICES
              <ChevronDown 
                size={16} 
                className="footer-chevron" 
                style={{ transform: openSections.services ? 'rotate(180deg)' : 'none' }}
              />
            </h3>
            <ul className={`footer-list ${openSections.services ? 'open' : ''}`}>
              {[
                { label: 'Laptop Repair', slug: 'laptop-services' },
                { label: 'Virus Removal', slug: 'virus-security' },
                { label: 'WiFi & Networking', slug: 'home-network' },
                { label: 'Apple Mac Support', slug: 'apple-mac' },
                { label: 'PC & Desktop Repair', slug: 'desktop-pc' },
                { label: 'Emergency Support', slug: 'emergency' },
                { label: 'Data Recovery', slug: 'data-recovery' },
                { label: 'Remote Support', slug: 'remote-support' },
              ].map(s => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#00D2FF')}
                    onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#888888')}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                  onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#00B8DF')}
                  onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#00D2FF')}
                >
                  All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h3
              onClick={() => toggleSection('areas')}
              className="font-syne footer-header"
            >
              AREAS WE COVER
              <ChevronDown 
                size={16} 
                className="footer-chevron" 
                style={{ transform: openSections.areas ? 'rotate(180deg)' : 'none' }}
              />
            </h3>
            <ul className={`footer-list ${openSections.areas ? 'open' : ''}`}>
              {[
                { slug: 'barnet', name: 'Barnet' },
                { slug: 'camden', name: 'Camden' },
                { slug: 'enfield', name: 'Enfield' },
                { slug: 'hackney', name: 'Hackney' },
                { slug: 'islington', name: 'Islington' },
                { slug: 'westminster', name: 'Westminster' },
              ].map(area => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}`}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#00D2FF')}
                    onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#888888')}
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/areas"
                  style={{ color: '#00D2FF', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                  onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#00B8DF')}
                  onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#00D2FF')}
                >
                  All London Areas →
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3
              onClick={() => toggleSection('company')}
              className="font-syne footer-header"
            >
              COMPANY
              <ChevronDown 
                size={16} 
                className="footer-chevron" 
                style={{ transform: openSections.company ? 'rotate(180deg)' : 'none' }}
              />
            </h3>
            <ul className={`footer-list ${openSections.company ? 'open' : ''}`}>
              {[
                { href: '/about', label: 'About Us' },
                { href: '/how-it-works', label: 'How It Works & Coverage' },
                { href: '/blog', label: 'Blog & Articles' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/book', label: 'Book a Repair' },
                { href: '/portal', label: 'My Portal' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms & Conditions' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}
                    onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = '#00D2FF')}
                    onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#888888')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              onClick={() => toggleSection('contact')}
              className="font-syne footer-header"
            >
              CONTACT
              <ChevronDown 
                size={16} 
                className="footer-chevron" 
                style={{ transform: openSections.contact ? 'rotate(180deg)' : 'none' }}
              />
            </h3>
            <div className={`footer-list ${openSections.contact ? 'open' : ''}`}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>
                {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ'}<br />
                Available 7 days a week<br />
                8am – 8pm (emergency 24/7)
              </p>
              <Link
                href="/book"
                className="glass-glow-btn"
                style={{
                  marginTop: '0.85rem',
                }}
              >
                Get Help Now
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {currentYear} Neuro IT. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Privacy
            </Link>{' '}
            •{' '}
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
