import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, AUTH_LIMIT, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Rate limit lead generation requests by IP to prevent spamming
    const ip = getClientIp(req)
    const rateLimitRes = await checkRateLimit(ip, AUTH_LIMIT)
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email, phone, postcode } = await req.json()

    if (!email || !email.includes('@') || !postcode) {
      return NextResponse.json({ error: 'Valid email and postcode are required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        postcode: postcode.trim().toUpperCase(),
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Lead creation failed:', error)
    return NextResponse.json({ error: 'Failed to record lead request' }, { status: 500 })
  }
}
