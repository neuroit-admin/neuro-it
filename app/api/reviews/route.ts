import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, AUTH_LIMIT, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // 1. Rate limiting
    const ip = getClientIp(req)
    const rateLimitRes = await checkRateLimit(ip, AUTH_LIMIT)
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { ticketId, rating, comment, token } = await req.json()

    if (!ticketId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Missing or invalid fields: ticketId, rating (1-5)' }, { status: 400 })
    }

    // 2. Fetch ticket to verify status and ownership
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { review: true }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed repairs' }, { status: 400 })
    }

    if (ticket.review) {
      return NextResponse.json({ error: 'A review has already been submitted for this repair' }, { status: 400 })
    }

    // 3. Authorization Check (Google session OR secure URL token)
    const session = await getServerSession(authOptions)
    const isTokenValid = token && ticket.securityToken === token
    const isOwner = session && (session.user as any).id === ticket.customerId

    if (!isTokenValid && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized to review this ticket' }, { status: 401 })
    }

    // 4. Create the Review
    const review = await prisma.review.create({
      data: {
        ticketId,
        customerId: ticket.customerId,
        rating: Math.round(rating),
        comment: comment ? comment.trim() : null,
        isApproved: false, // Requires admin moderation
        isPublic: false,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Review submission failed:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
