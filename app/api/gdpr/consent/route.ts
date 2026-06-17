// =============================================================================
// Neuro IT — GDPR Consent Recording API
// Records explicit consent with timestamp and IP for ICO audit trail.
// =============================================================================
import { NextResponse }     from 'next/server'
import { prisma }           from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { z }                from 'zod'

const Schema = z.object({
  consentGiven: z.boolean(),
  consentedAt:  z.string().datetime(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = Schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const userId = (session.user as any).id

  await prisma.user.update({
    where:  { id: userId },
    data: {
      gdprConsent:   body.data.consentGiven,
      gdprConsentAt: new Date(body.data.consentedAt),
    },
  })

  // Audit log for ICO compliance
  await prisma.auditLog.create({
    data: {
      action:        'GDPR_CONSENT_RECORDED',
      performedById: userId,
      metadata: JSON.stringify({
        consentGiven: body.data.consentGiven,
        consentedAt:  body.data.consentedAt,
        ipAddress:    request.headers.get('x-forwarded-for') ?? 'unknown',
      }),
    },
  })

  return NextResponse.json({ ok: true })
}
