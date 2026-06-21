import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let categories = await prisma.serviceCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        services: {
          where: {
            isActive: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    })

    if (!categories || categories.length === 0) {
      const staticCategories = require('@/lib/staticServices.json')
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
          }
        })

        for (const s of cat.services) {
          await prisma.service.upsert({
            where: { id: s.id },
            update: {
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
            create: {
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
            }
          })
        }
      }

      // Re-fetch after seeding
      categories = await prisma.serviceCategory.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
        include: {
          services: {
            where: {
              isActive: true,
            },
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      })
    }

    let formatted = categories.map(cat => ({
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

    // Fetch flat deposit fee
    let flatDepositFee = 15.00
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'flat_deposit_fee' },
      })
      if (setting && setting.value) {
        flatDepositFee = parseFloat(setting.value)
      }
    } catch (err) {
      console.error('Failed to fetch flat_deposit_fee setting:', err)
    }

    return NextResponse.json({ categories: formatted, flatDepositFee })
  } catch (error) {
    console.error('Public services API error, using static fallback:', error)
    try {
      const staticCategories = require('@/lib/staticServices.json')
      return NextResponse.json({ categories: staticCategories, flatDepositFee: 15.00 })
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
