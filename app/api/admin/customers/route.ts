import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      include: {
        ticketsAsClient: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = customers.map(c => {
      const totalTickets = c.ticketsAsClient.length
      const activeTickets = c.ticketsAsClient.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).length
      const lastTicket = c.ticketsAsClient[0]?.createdAt || null

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalTickets,
        activeTickets,
        joined: c.createdAt,
        lastTicket,
      }
    })

    return NextResponse.json({ customers: formatted })
  } catch (error) {
    console.error('Admin customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
