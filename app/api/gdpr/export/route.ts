import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GDPR Data Export
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      devices: true,
      ticketsAsClient: {
        include: {
          service: { select: { name: true } },
          payment: true,
          review: true,
        },
      },
      conversations: true,
    },
  })

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Log the data export
  await prisma.auditLog.create({
    data: {
      action: 'GDPR_DATA_EXPORT',
      performedById: userId,
      metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
    },
  })

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    data: {
      profile: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        createdAt: userData.createdAt,
        gdprConsent: userData.gdprConsent,
        gdprConsentAt: userData.gdprConsentAt,
      },
      addresses: userData.addresses.map(a => ({
        postcode: a.postcode,
        houseNumber: a.houseNumber,
        addressLine1: a.addressLine1,
        city: a.city,
      })),
      devices: userData.devices.map(d => ({
        brand: d.brand,
        model: d.model,
        os: d.os,
      })),
      tickets: userData.ticketsAsClient.map(t => ({
        referenceCode: t.referenceCode,
        service: t.service?.name,
        status: t.status,
        issueDescription: t.issueDescription,
        createdAt: t.createdAt,
        finalPrice: t.finalPrice,
      })),
    },
  })
}
