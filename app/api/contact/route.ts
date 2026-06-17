import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
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

    const submission = {
      id: Math.random().toString(36).substring(2, 9),
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      createdAt: new Date().toISOString(),
    }

    // Append to a local JSON file inside uploads directory for persistence
    const dirPath = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const filePath = path.join(dirPath, 'contacts.json')
    let submissions = []
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        submissions = JSON.parse(fileContent)
      } catch (e) {
        submissions = []
      }
    }
    submissions.push(submission)
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), 'utf-8')

    console.log('New Contact Submission:', submission)

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact submission failed:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}
