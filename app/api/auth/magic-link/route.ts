import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { checkRateLimit, AUTH_LIMIT, getClientIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting based on IP
    const ip = getClientIp(req)
    const rateLimitRes = await checkRateLimit(ip, AUTH_LIMIT)
    if (!rateLimitRes.success) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { email, callbackUrl, isAdminLogin, expiresInHours } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    
    // 2. Enforce separation between Admin and Customer login
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    const targetAdminEmail = (process.env.ADMIN_EMAIL || 'admin@neuro-it.co.uk').trim().toLowerCase()

    if (isAdminLogin) {
      if (!user || user.role !== 'ADMIN') {
        if (cleanEmail === targetAdminEmail) {
          if (user) {
            user = await prisma.user.update({
              where: { email: cleanEmail },
              data: { role: 'ADMIN' }
            })
          } else {
            user = await prisma.user.create({
              data: {
                email: cleanEmail,
                name: 'Admin',
                role: 'ADMIN',
                gdprConsent: true,
                gdprConsentAt: new Date()
              }
            })
          }
        } else {
          return NextResponse.json(
            { error: 'Access denied. Only administrator accounts are allowed.' },
            { status: 403 }
          )
        }
      }
    } else {
      if (user && user.role === 'ADMIN') {
        return NextResponse.json(
          { error: 'Administrator accounts must sign in through the secure portal.' },
          { status: 403 }
        )
      }
    }

    // Generate secure verification token
    const token = crypto.randomUUID()
    const expiryDuration = expiresInHours ? Math.min(expiresInHours, 72) * 60 * 60 * 1000 : 15 * 60 * 1000
    const expires = new Date(Date.now() + expiryDuration)

    // Store in verification token table
    await prisma.verificationToken.create({
      data: {
        email: cleanEmail,
        token,
        expires,
      },
    })

    // Construct the magic link URL dynamically from request headers to support port 4000
    const host = req.headers.get('host') || 'localhost:4000'
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    const defaultCallback = isAdminLogin ? '/admin' : '/portal'
    const targetCallback = callbackUrl ? encodeURIComponent(callbackUrl) : encodeURIComponent(defaultCallback)
    
    // Redirect admins to /admin/login, customers to /login
    const loginRoute = isAdminLogin ? '/admin/login' : '/login'
    const magicLink = `${baseUrl}${loginRoute}?token=${token}&callbackUrl=${targetCallback}`

    // Send the email (catch errors in dev to avoid breaking local testing)
    try {
      await sendEmail({
        to: cleanEmail,
        subject: isAdminLogin ? 'Admin Portal Sign In' : 'Sign in to Neuro IT',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #0A0A0A; color: #FFFFFF; border: 1px solid #2A2A2A; border-radius: 8px;">
            <h2 style="font-family: sans-serif; color: #FFFFFF; font-weight: 800; font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem;">NEURO<span style="color: #00D2FF">IT</span></h2>
            <p style="font-size: 1rem; color: #E0E0E0; line-height: 1.6; margin-bottom: 1.5rem;">Hello,</p>
            <p style="font-size: 1rem; color: #E0E0E0; line-height: 1.6; margin-bottom: 2rem;">
              Click the button below to sign in to your Neuro IT ${isAdminLogin ? 'Admin Panel' : 'portal'}. This link will expire in ${expiresInHours ? `${expiresInHours} hours` : '15 minutes'}.
            </p>
            <div style="text-align: center; margin-bottom: 2rem;">
              <a href="${magicLink}" style="display: inline-block; padding: 0.875rem 2rem; background: #00D2FF; color: #0A0A0A; text-decoration: none; font-weight: 700; border-radius: 4px; font-size: 0.95rem;">
                Sign In to ${isAdminLogin ? 'Admin Panel' : 'Portal'}
              </a>
            </div>
            <p style="font-size: 0.85rem; color: #888888; line-height: 1.6;">If you did not request this email, you can safely ignore it.</p>
            <hr style="border: none; border-top: 1px solid #2A2A2A; margin: 2rem 0;" />
            <p style="font-size: 0.8rem; color: #555555; text-align: center;">Neuro IT Support Services, London UK</p>
          </div>
        `
      })
    } catch (emailErr) {
      console.warn('[DEVELOPMENT WARNING] Resend email dispatch failed, continuing locally:', emailErr)
    }

    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV
    if (isDev) {
      console.log(`\n======================================================`)
      console.log(`[DEVELOPMENT] MAGIC LINK FOR ${cleanEmail}:`)
      console.log(magicLink)
      console.log(`======================================================\n`)
    }

    return NextResponse.json({ 
      success: true,
      magicLink: isDev ? magicLink : undefined,
      devLink: isDev ? magicLink : undefined
    })
  } catch (error) {
    console.error('Magic link creation failed:', error)
    return NextResponse.json({ error: 'Failed to generate sign-in link' }, { status: 500 })
  }
}
