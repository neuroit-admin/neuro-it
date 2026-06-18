import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import { prisma } from '@/lib/prisma'
import ServicesClient from './ServicesClient'
import staticCategories from '@/lib/staticServices.json'

export const metadata: Metadata = {
  title: 'Services & Pricing | Neuro IT London',
  description:
    'Browse 50+ professional IT repair services in London with transparent pricing. Laptop screen repair, virus removal, data recovery, WiFi setup, Apple Mac support. No Fix No Fee guarantee.',
  openGraph: {
    title: 'Services & Pricing | Neuro IT London',
    description:
      'Browse 50+ professional IT repair services with transparent pricing. Same-day home visits by DBS-checked engineers.',
    url: 'https://neuro-it.co.uk/services',
    type: 'website',
  },
  alternates: {
    canonical: 'https://neuro-it.co.uk/services',
  },
}

async function getCategories() {
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

    return categories.map(cat => ({
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
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return []
  }
}

export default async function ServicesPage() {
  let categories = await getCategories()

  if (!categories || categories.length === 0) {
    categories = staticCategories
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '64px' }}>
        <ServicesClient initialCategories={categories} />
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
