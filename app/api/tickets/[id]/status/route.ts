import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  const { status } = await req.json()

  const validStatuses = ['CREATED', 'DIAGNOSING', 'CONFIRMED', 'TECH_ASSIGNED', 'ON_THE_WAY', 'REPAIRING', 'RECEIVED', 'SHIPPED_BACK', 'COMPLETED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
  }

  const data: any = { status }
  if (status === 'TECH_ASSIGNED') data.techAssignedAt = new Date()
  if (status === 'ON_THE_WAY') data.techOnWayAt = new Date()
  if (status === 'COMPLETED') data.completedAt = new Date()
  if (status === 'CANCELLED') data.cancelledAt = new Date()

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
  })

  await prisma.auditLog.create({
    data: {
      ticketId: id,
      action: `STATUS_CHANGE: ${status}`,
      performedById: (session.user as any).id,
    },
  })

  return NextResponse.json({ ticket })
}
