import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StickyBottomBar from '@/components/layout/StickyBottomBar'
import { prisma } from '@/lib/prisma'
import ServicesPreviewClient from './ServicesPreviewClient'

export const metadata: Metadata = {
  title: 'Services & Pricing Preview | Neuro IT London',
  description: 'Preview the new Spotlight Cards and Sticky Mobile Category tabs layout.',
  robots: { index: false, follow: false },
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
    console.error('Failed to fetch services for preview:', error)
    return []
  }
}

export default async function ServicesPreviewPage() {
  const categories = await getCategories()

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '64px' }}>
        <ServicesPreviewClient initialCategories={categories} />
      </main>
      <Footer />
      <StickyBottomBar />
    </>
  )
}
