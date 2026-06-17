import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // 1. Total Tickets
    const totalTickets = await prisma.ticket.count()

    // 2. Open Tickets (any status except COMPLETED or CANCELLED)
    const openTickets = await prisma.ticket.count({
      where: {
        NOT: {
          status: { in: ['COMPLETED', 'CANCELLED'] },
        },
      },
    })

    // 3. Revenue
    const paymentsSum = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: { in: ['PAID', 'SUCCESS', 'DEPOSIT_PAID'] },
      },
    })
    const revenue = paymentsSum._sum.amount || 0

    // 4. Avg Rating
    const ratingAvg = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    })
    const avgRating = ratingAvg._avg.rating ? Number(ratingAvg._avg.rating.toFixed(1)) : 0

    // 5. Recent Tickets
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
    })

    const formattedRecentTickets = recentTickets.map(t => ({
      id: t.id,
      ref: t.referenceCode,
      customer: t.customer?.name || 'Guest',
      service: t.service?.name || 'Diagnostic/Repair',
      status: t.status,
      priority: t.priority,
    }))

    return NextResponse.json({
      stats: [
        { label: 'Total Tickets', value: String(totalTickets), change: 'All time', color: '#00D2FF' },
        { label: 'Open Tickets', value: String(openTickets), change: 'Active', color: '#F59E0B' },
        { label: 'Revenue', value: `£${revenue.toLocaleString('en-GB')}`, change: 'Total Paid', color: '#22C55E' },
        { label: 'Avg Rating', value: String(avgRating || '—'), change: 'From reviews', color: '#F59E0B' },
      ],
      recentTickets: formattedRecentTickets,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
