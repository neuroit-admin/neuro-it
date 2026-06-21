import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
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

    // 3. Save to the database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone || null,
        message: sanitizedMessage,
      },
    })

    console.log('New Contact Submission Saved to DB:', contactMessage.id)

    // 4. Fetch admin notification email from settings
    let adminEmail = 'neuroit.london@gmail.com'
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'admin_notification_email' },
      })
      if (setting?.value) {
        adminEmail = setting.value
      }
    } catch (err) {
      console.warn('Could not fetch admin email setting, using default:', err)
    }

    // 5. Send email notification to admin
    const adminEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #0A0A0A; color: #FFFFFF; border: 1px solid #2A2A2A; border-radius: 8px;">
        <h2 style="color: #00D2FF; font-weight: 800; font-size: 1.3rem; margin-bottom: 1.5rem; text-align: center;">📩 New Website Contact Message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 2rem;">
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem; width: 120px;">Name</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem; font-weight: bold;">${sanitizedName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Email</td>
            <td style="padding: 0.75rem 0; color: #00D2FF; font-size: 0.95rem;"><a href="mailto:${sanitizedEmail}" style="color: #00D2FF;">${sanitizedEmail}</a></td>
          </tr>
          ${sanitizedPhone ? `<tr style="border-bottom: 1px solid #2A2A2A;">
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem;">Phone</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem;">${sanitizedPhone}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 0.75rem 0; color: #888888; font-size: 0.9rem; vertical-align: top;">Message</td>
            <td style="padding: 0.75rem 0; color: #FFFFFF; font-size: 0.95rem; line-height: 1.6;">${sanitizedMessage.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <p style="color: #888888; font-size: 0.8rem; text-align: center; margin-top: 1rem;">
          Received via neuroit.co.uk Contact Form
        </p>
      </div>
    `

    sendEmail({
      to: adminEmail,
      subject: `[CONTACT] New message from ${sanitizedName}`,
      html: adminEmailHtml,
    }).catch(err => console.error('Failed to send contact form admin email notification:', err))

    // 6. Send auto-reply to the user
    const userReplyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #FFFFFF; color: #111111; border: 1px solid #EEEEEE; border-radius: 8px;">
        <h2 style="color: #00D2FF; font-weight: 800; font-size: 1.3rem; margin-bottom: 1rem;">Thank You, ${sanitizedName}!</h2>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #333333;">
          We've received your message and will get back to you as soon as possible — typically within a few hours during business hours.
        </p>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #333333;">
          <strong>Your message:</strong><br>
          <span style="color: #555555; font-style: italic;">"${sanitizedMessage}"</span>
        </p>
        <p style="font-size: 0.95rem; line-height: 1.6; color: #333333;">
          Need faster help? <a href="https://wa.me/447982380020" style="color: #00D2FF; font-weight: bold;">Chat with us on WhatsApp</a> or <a href="https://neuroit.co.uk/book" style="color: #00D2FF; font-weight: bold;">book a repair directly</a>.
        </p>
        <hr style="border: none; border-top: 1px solid #EEEEEE; margin: 1.5rem 0;" />
        <p style="font-size: 0.8rem; color: #999999; text-align: center;">Neuro IT · London's Home IT Support</p>
      </div>
    `

    sendEmail({
      to: sanitizedEmail,
      subject: `We received your message — Neuro IT`,
      html: userReplyHtml,
    }).catch(err => console.error('Failed to send contact form auto-reply email:', err))

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact submission failed:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}

