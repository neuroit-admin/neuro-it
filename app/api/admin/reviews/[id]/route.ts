import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { isApproved } = await req.json()

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved,
        isPublic: isApproved, // Automatically make public if approved
      },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Review moderation patch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
