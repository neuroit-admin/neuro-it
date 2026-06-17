import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'TECHNICIAN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        technician: {
          select: {
            name: true,
          },
        },
        address: true,
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Admin tickets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
