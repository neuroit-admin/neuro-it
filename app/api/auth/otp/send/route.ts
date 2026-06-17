import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { checkRateLimit, AUTH_LIMIT, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting based on IP to prevent abuse
    const ip = getClientIp(req)
    const rateLimitRes = await checkRateLimit(ip, AUTH_LIMIT)
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 2. Clean up any existing tokens for this email to prevent DB clutter
    await prisma.verificationToken.deleteMany({
      where: { email: cleanEmail }
    }).catch(err => console.warn('Old token cleanup failed:', err))

    // 3. Generate a non-colliding 6-digit OTP code
    let otpCode = ''
    let exists = true
    let attempts = 0
    while (exists && attempts < 10) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const existing = await prisma.verificationToken.findUnique({
        where: { token: otpCode }
      })
      if (!existing) {
        exists = false
      }
      attempts++
    }

    // 4. Set expiration to 15 minutes
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    // 5. Store in the verification token table
    await prisma.verificationToken.create({
      data: {
        email: cleanEmail,
        token: otpCode,
        expires,
      },
    })

    // 6. Send OTP Email using Resend
    try {
      await sendEmail({
        to: cleanEmail,
        subject: `Your Verification Code: ${otpCode} — Neuro IT`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #0A0A0A; color: #FFFFFF; border: 1px solid #2A2A2A; border-radius: 8px;">
            <h2 style="font-family: sans-serif; color: #FFFFFF; font-weight: 800; font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem;">NEURO<span style="color: #00D2FF">IT</span></h2>
            <p style="font-size: 1rem; color: #E0E0E0; line-height: 1.6; margin-bottom: 1.5rem;">Hello,</p>
            <p style="font-size: 1rem; color: #E0E0E0; line-height: 1.6; margin-bottom: 1.5rem;">
              Thank you for booking a repair with Neuro IT. Please use the following 6-digit verification code to confirm your email and complete your booking.
            </p>
            <div style="text-align: center; margin: 2rem 0;">
              <span style="display: inline-block; letter-spacing: 0.25em; font-family: monospace; font-size: 2.25rem; font-weight: 800; color: #00D2FF; padding: 1rem 2rem; background: #121212; border: 1px solid #2A2A2A; border-radius: 6px;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 0.9rem; color: #888888; line-height: 1.6; margin-bottom: 2rem;">
              This code will expire in 15 minutes. If you did not request this verification code, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 2rem 0;" />
            <p style="font-size: 0.8rem; color: #555555; text-align: center;">Neuro IT Support Services, London UK</p>
          </div>
        `
      })
    } catch (emailErr) {
      console.warn('[DEVELOPMENT WARNING] Resend OTP email dispatch failed, continuing locally:', emailErr)
    }

    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV
    if (isDev) {
      console.log(`\n======================================================`)
      console.log(`[DEVELOPMENT] OTP CODE FOR ${cleanEmail}: ${otpCode}`)
      console.log(`======================================================\n`)
    }

    return NextResponse.json({ 
      success: true,
      // Expose OTP in development mode for easy manual/automated testing
      otpCode: isDev ? otpCode : undefined
    })
  } catch (error) {
    console.error('OTP generation failed:', error)
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 })
  }
}
