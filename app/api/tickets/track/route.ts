import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, TRACKING_LIMIT, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // 1. Rate Limiting Check
  const ip = getClientIp(req)
  const rateLimit = await checkRateLimit(ip, TRACKING_LIMIT)
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many tracking attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }

  try {
    const { referenceCode, email } = await req.json()

    if (!referenceCode || !email) {
      return NextResponse.json(
        { error: 'Both reference code and email are required.' },
        { status: 400 }
      )
    }

    const cleanRef = referenceCode.trim().toUpperCase()
    const cleanEmail = email.trim().toLowerCase()

    const ticket = await prisma.ticket.findFirst({
      where: {
        referenceCode: cleanRef,
        customer: {
          email: cleanEmail,
        },
      },
      include: {
        service: true,
        address: true,
        technician: {
          include: {
            techProfile: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'No ticket was found matching that reference code and email.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Guest tracking API error:', error)
    return NextResponse.json(
      { error: 'An error occurred while tracking your repair. Please try again.' },
      { status: 500 }
    )
  }
}
