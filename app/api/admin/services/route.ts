import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
      include: {
        services: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    })

    const formatted = categories.map(cat => ({
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
        priceMin: s.basePriceMin,
        priceMax: s.basePriceMax,
        callOutFee: s.callOutFee,
        isActive: s.isActive,
        description: s.description,
        isEmergencyReady: s.isEmergencyReady,
      })),
    }))

    return NextResponse.json({ categories: formatted })
  } catch (error) {
    console.error('Admin services API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, categoryId, basePriceMin, basePriceMax, callOutFee, isActive, description, isEmergencyReady } = body

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        categoryId,
        basePriceMin: parseFloat(basePriceMin) || 0,
        basePriceMax: parseFloat(basePriceMax) || 0,
        callOutFee: parseFloat(callOutFee) || 0,
        isActive: isActive !== false,
        description: description || null,
        isEmergencyReady: isEmergencyReady !== false,
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Admin create service error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { id, name, basePriceMin, basePriceMax, callOutFee, isActive, description, isEmergencyReady } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing service ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    if (basePriceMin !== undefined) updateData.basePriceMin = parseFloat(basePriceMin)
    if (basePriceMax !== undefined) updateData.basePriceMax = parseFloat(basePriceMax)
    if (callOutFee !== undefined) updateData.callOutFee = parseFloat(callOutFee)
    if (isActive !== undefined) updateData.isActive = isActive
    if (description !== undefined) updateData.description = description
    if (isEmergencyReady !== undefined) updateData.isEmergencyReady = isEmergencyReady

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Admin update service error:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing service ID' }, { status: 400 })
    }

    // Toggle active state rather than hard delete to preserve ticket relation history
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    })

    return NextResponse.json({ service: updated })
  } catch (error) {
    console.error('Admin delete service error:', error)
    return NextResponse.json({ error: 'Failed to toggle service state' }, { status: 500 })
  }
}
