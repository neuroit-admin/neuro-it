// =============================================================================
// Neuro IT — Root Layout (Production)
// Changes vs original:
//  1. OpenGraph image added
//  2. JSON-LD LocalBusiness + FAQ schema injected globally
//  3. robots / canonical meta added
//  4. Error boundary wrapper added
//  5. Font variable name fixed (Outfit → --font-syne kept for compat)
// =============================================================================

import type { Metadata, Viewport } from 'next'
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google'
import Providers         from '@/components/providers/SessionProvider'
import WhatsAppWidget    from '@/components/layout/WhatsAppWidget'
import ErrorBoundary     from '@/components/providers/ErrorBoundary'
import Script from 'next/script'
import { LocalBusinessSchema, FAQSchema } from '@/components/seo/JsonLd'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import './globals.css'

const outfit = Outfit({
  subsets:  ['latin'],
  variable: '--font-syne',   // kept for backward compat with all components
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  weight:   ['300', '400', '500', '600'],
  display:  'swap',
})

const jetbrains = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains',
  weight:   ['400', '500'],
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://neuroit.co.uk'),

  title: {
    template: '%s | Neuro IT London',
    default:  "Neuro IT — London's Smartest Home IT Support",
  },
  description:
    'Same-day IT support at your door. Vetted technicians, no fix no fee guarantee. Laptop repair, virus removal, WiFi setup across London.',
  keywords:
    'IT support London, laptop repair London, computer repair London, home IT support, same day IT support, vetted technician',

  openGraph: {
    title:       "Neuro IT — London's Smartest Home IT Support",
    description: 'Same-day IT support at your door. Vetted technicians, no fix no fee.',
    type:        'website',
    locale:      'en_GB',
    url:         'https://neuroit.co.uk',
    siteName:    'Neuro IT',
    images: [
      {
        url:    '/og-image.jpg',   // 1200×630 — create this file
        width:  1200,
        height: 630,
        alt:    'Neuro IT — London Home IT Support',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       "Neuro IT — London's Smartest IT Support",
    description: 'Same-day home IT support. Vetted. No fix no fee.',
    images:      ['/og-image.jpg'],
  },

  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  alternates: {
    canonical: 'https://neuroit.co.uk',
  },

  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor:    '#00D2FF',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <LocalBusinessSchema />
        <FAQSchema />
      </head>
      <body className={`${outfit.variable} ${dmSans.variable} ${jetbrains.variable} font-sans antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EJ66EEVKXR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-EJ66EEVKXR');
          `}
        </Script>
        <ErrorBoundary>
          <ThemeProvider>
            <div className="fluid-bg-container" aria-hidden="true">
              <div className="fluid-blob fluid-blob-1" />
              <div className="fluid-blob fluid-blob-2" />
              <div className="fluid-blob fluid-blob-3" />
            </div>
            <Providers>
              {children}
              <WhatsAppWidget />
            </Providers>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
