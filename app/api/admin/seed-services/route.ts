import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Admin-only endpoint to seed service categories from static JSON into DB
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const staticCategories = require('@/lib/staticServices.json')
    let seeded = 0
    let skipped = 0

    for (const cat of staticCategories) {
      await prisma.serviceCategory.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          isActive: cat.isActive,
          displayOrder: cat.displayOrder,
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          isActive: cat.isActive,
          displayOrder: cat.displayOrder,
        },
      })

      for (const s of cat.services) {
        const existing = await prisma.service.findUnique({ where: { id: s.id } })
        if (!existing) {
          await prisma.service.create({
            data: {
              id: s.id,
              categoryId: cat.id,
              name: s.name,
              slug: s.slug,
              description: s.description,
              basePriceMin: s.basePriceMin,
              basePriceMax: s.basePriceMax,
              callOutFee: s.callOutFee,
              isEmergencyReady: s.isEmergencyReady,
              isActive: s.isActive,
            },
          })
          seeded++
        } else {
          await prisma.service.update({
            where: { id: s.id },
            data: {
              categoryId: cat.id,
              name: s.name,
              slug: s.slug,
              description: s.description,
              basePriceMin: s.basePriceMin,
              basePriceMax: s.basePriceMax,
              callOutFee: s.callOutFee,
              isEmergencyReady: s.isEmergencyReady,
              isActive: s.isActive,
            },
          })
          skipped++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeding complete: ${seeded} new services created, ${skipped} updated.`,
      seeded,
      skipped,
    })
  } catch (error) {
    console.error('Seed services error:', error)
    return NextResponse.json({ error: 'Failed to seed services' }, { status: 500 })
  }
}
