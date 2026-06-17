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
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        ticket: {
          include: {
            service: true,
          },
        },
      },
    })

    const formatted = reviews.map(r => ({
      id: r.id,
      customerName: r.customer?.name || 'Guest',
      service: r.ticket?.service?.name || 'Diagnostic/Repair',
      rating: r.rating,
      comment: r.comment,
      isApproved: r.isApproved,
      isPublic: r.isPublic,
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ reviews: formatted })
  } catch (error) {
    console.error('Admin reviews GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
