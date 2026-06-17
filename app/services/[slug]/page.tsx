import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import { prisma } from '@/lib/prisma'
import CategoryDetailClient from './CategoryDetailClient'

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  'laptop-services': {
    title: 'Laptop Repair Services London | Screen, Battery & Hardware | Neuro IT',
    description: 'Professional laptop repair in London. Screen replacement, battery upgrades, water damage recovery, keyboard repair. DBS-checked engineers, same-day home visits. No Fix No Fee.',
  },
  'desktop-pc': {
    title: 'Desktop PC Repair London | Custom Builds & Upgrades | Neuro IT',
    description: 'Expert desktop PC support in London. Component diagnostics, custom builds, graphics card repairs, gaming PC upgrades. Same-day home visits by certified technicians.',
  },
  'software-os': {
    title: 'Software & OS Installation London | Windows, macOS Setup | Neuro IT',
    description: 'Clean OS installations, driver setup, software activation, password recovery, and email sync. Professional software support at your London home.',
  },
  'virus-security': {
    title: 'Virus Removal & Security London | Malware, Ransomware | Neuro IT',
    description: 'Eradicate malware, ransomware, and security threats. Full safety audits, two-factor setup, and real-time protection configuration across London.',
  },
  'data-recovery': {
    title: 'Data Recovery Services London | HDD, SSD, RAID | Neuro IT',
    description: 'Recover lost photos, files, and RAID arrays from failed drives. Automated cloud backup setup and secure data migration in London.',
  },
  'home-network': {
    title: 'Home Network & WiFi Setup London | Mesh, NAS | Neuro IT',
    description: 'Setup routers, mesh WiFi systems, smart switches, and NAS servers. Eliminate dead spots and optimise your London home network.',
  },
  'remote-support': {
    title: 'Remote IT Support London | Screen Share Diagnostics | Neuro IT',
    description: 'Instant remote diagnostics via screen share. Resolve software issues, application configurations, and settings without waiting for a home visit.',
  },
  'new-device-setup': {
    title: 'New Device Setup London | Laptop, Phone, Smart TV | Neuro IT',
    description: 'Professional unboxing, data transfers, and full setup for new laptops, PCs, iPhones, and Smart TVs. Same-day service across London.',
  },
  'apple-mac': {
    title: 'Apple Mac Repair London | MacBook, iMac, iPhone | Neuro IT',
    description: 'Specialist Apple repair services in London. MacBook display replacement, battery service, macOS installations, and iPhone screen repairs.',
  },
  'emergency': {
    title: 'Emergency IT Support London | Same-Day, Out-of-Hours | Neuro IT',
    description: 'Urgent weekend, evening, and bank holiday IT support. Priority dispatch for critical system failures across London. Available 7 days a week.',
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = CATEGORY_META[slug]

  if (!meta) {
    return {
      title: 'Service Category | Neuro IT London',
      description: 'Professional IT repair services in London.',
    }
  }

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://neuro-it.co.uk/services/${slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://neuro-it.co.uk/services/${slug}`,
    },
  }
}

async function getCategoryData(slug: string) {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    const serialized = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
      services: cat.services.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        basePriceMin: s.basePriceMin,
        basePriceMax: s.basePriceMax,
        callOutFee: s.callOutFee,
        isEmergencyReady: s.isEmergencyReady,
        isActive: s.isActive,
      })),
    }))

    const currentCategory = serialized.find(cat => cat.slug === slug)
    const otherCategories = serialized.filter(cat => cat.slug !== slug)

    return { currentCategory, otherCategories }
  } catch (error) {
    console.error('Failed to fetch category data:', error)
    return { currentCategory: null, otherCategories: [] }
  }
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params
  const { currentCategory, otherCategories } = await getCategoryData(slug)

  if (!currentCategory) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '64px' }}>
        <CategoryDetailClient
          currentCategory={currentCategory}
          otherCategories={otherCategories}
        />
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
