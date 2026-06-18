import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, CONTACT_LIMIT, getClientIp } from '@/lib/rate-limit'

function sanitizeInput(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function POST(req: Request) {
  // 1. Rate Limiting Check
  const ip = getClientIp(req)
  const rateLimit = await checkRateLimit(ip, CONTACT_LIMIT)
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many contact form submissions. Please try again in an hour.' },
      { status: 429 }
    )
  }

  try {
    const { name, email, phone, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    // 2. Input Sanitization to prevent XSS
    const sanitizedName = sanitizeInput(name.trim())
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase())
    const sanitizedPhone = sanitizeInput(phone ? phone.trim() : '')
    const sanitizedMessage = sanitizeInput(message.trim())

    // Save to the database instead of local file
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone || null,
        message: sanitizedMessage,
      },
    })

    console.log('New Contact Submission Saved to DB:', contactMessage)

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact submission failed:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
