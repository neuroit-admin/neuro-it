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
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        ticketsAsClient: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            service: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const formatted = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      joined: customer.createdAt,
      addresses: customer.addresses,
      tickets: customer.ticketsAsClient.map(t => ({
        id: t.id,
        referenceCode: t.referenceCode,
        status: t.status,
        service: t.service?.name || 'Diagnostic/Repair',
        createdAt: t.createdAt,
      })),
    }

    return NextResponse.json({ customer: formatted })
  } catch (error) {
    console.error('Admin customer detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
