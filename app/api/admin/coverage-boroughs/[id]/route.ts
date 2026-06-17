import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { name, slug, zone, lat, lng, postcodes, isActive } = body

    const existingBorough = await prisma.coverageBorough.findUnique({
      where: { id }
    })

    if (!existingBorough) {
      return NextResponse.json({ error: 'Borough not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (zone !== undefined) {
      if (zone !== 'FREE_CALL_OUT' && zone !== 'STANDARD_999' && zone !== 'LONDON_FLEX') {
        return NextResponse.json({ error: 'Invalid zone type' }, { status: 400 })
      }
      updateData.zone = zone
    }
    if (lat !== undefined) updateData.lat = parseFloat(lat)
    if (lng !== undefined) updateData.lng = parseFloat(lng)
    if (postcodes !== undefined) updateData.postcodes = postcodes.toUpperCase().replace(/\s+/g, '')
    if (isActive !== undefined) updateData.isActive = isActive

    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (cleanSlug !== existingBorough.slug) {
        // Ensure new slug is unique
        const conflicting = await prisma.coverageBorough.findUnique({
          where: { slug: cleanSlug }
        })
        if (conflicting) {
          return NextResponse.json({ error: 'Slug already in use by another borough' }, { status: 400 })
        }
        updateData.slug = cleanSlug
      }
    }

    const borough = await prisma.coverageBorough.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ borough })
  } catch (error) {
    console.error('Update borough error:', error)
    return NextResponse.json({ error: 'Failed to update borough' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const existingBorough = await prisma.coverageBorough.findUnique({
      where: { id }
    })

    if (!existingBorough) {
      return NextResponse.json({ error: 'Borough not found' }, { status: 404 })
    }

    await prisma.coverageBorough.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete borough error:', error)
    return NextResponse.json({ error: 'Failed to delete borough' }, { status: 500 })
  }
}
