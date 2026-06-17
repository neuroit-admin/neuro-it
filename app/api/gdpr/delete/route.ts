import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GDPR Data Deletion Request
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  // Mark user for deletion (don't immediately delete — admin reviews)
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletionRequested: true,
      deletionRequestedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'GDPR_DELETION_REQUEST',
      performedById: userId,
      metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
    },
  })

  return NextResponse.json({
    message: 'Your data deletion request has been submitted. Your data will be deleted within 30 days as required by UK GDPR.',
    requestedAt: new Date().toISOString(),
  })
}
