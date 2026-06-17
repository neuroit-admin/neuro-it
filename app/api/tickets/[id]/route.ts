import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      service: true,
      address: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: {
        select: {
          id: true,
          name: true,
          techProfile: { select: { isDbsChecked: true, photoUrl: true } },
        },
      },
      payment: true,
      review: true,
      devicePhotos: true,
    },
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Allow access if guest has correct token OR user is owner OR user is admin/tech
  const isTokenValid = token && ticket.securityToken === token
  const isOwner = session && (session.user as any).id === ticket.customerId
  const isAdminOrTech = session && ((session.user as any).role === 'ADMIN' || (session.user as any).role === 'TECHNICIAN')

  if (!isTokenValid && !isOwner && !isAdminOrTech) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ticket })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'TECHNICIAN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const allowedFields = ['status', 'techId', 'finalPrice', 'adminNote', 'techInternalNote', 'priority']
  const data: any = {}
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  if (data.status === 'TECH_ASSIGNED') data.techAssignedAt = new Date()
  if (data.status === 'ON_THE_WAY') data.techOnWayAt = new Date()
  if (data.status === 'COMPLETED') data.completedAt = new Date()
  if (data.status === 'CANCELLED') data.cancelledAt = new Date()

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      ticketId: id,
      action: `STATUS_CHANGE: ${data.status || 'FIELD_UPDATE'}`,
      performedById: (session.user as any).id,
      metadata: JSON.stringify(data),
    },
  })

  return NextResponse.json({ ticket })
}
