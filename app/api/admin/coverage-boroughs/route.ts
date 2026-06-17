import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const boroughs = await prisma.coverageBorough.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ boroughs })
  } catch (error) {
    console.error('Fetch admin boroughs error:', error)
    return NextResponse.json({ error: 'Failed to fetch boroughs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, zone, lat, lng, postcodes, isActive } = body

    if (!name || !slug || !zone || lat === undefined || lng === undefined || !postcodes) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (zone !== 'FREE_CALL_OUT' && zone !== 'STANDARD_999' && zone !== 'LONDON_FLEX') {
      return NextResponse.json({ error: 'Invalid zone type. Must be FREE_CALL_OUT, STANDARD_999, or LONDON_FLEX' }, { status: 400 })
    }

    // Ensure slug is clean and unique
    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const existing = await prisma.coverageBorough.findUnique({
      where: { slug: cleanSlug }
    })
    if (existing) {
      return NextResponse.json({ error: 'A borough with this slug already exists' }, { status: 400 })
    }

    const borough = await prisma.coverageBorough.create({
      data: {
        name,
        slug: cleanSlug,
        zone,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        postcodes: postcodes.toUpperCase().replace(/\s+/g, ''),
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ borough })
  } catch (error) {
    console.error('Create borough error:', error)
    return NextResponse.json({ error: 'Failed to create borough' }, { status: 500 })
  }
}
