import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendNotification } from '@/lib/notifications'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { channel, to, templateKey, data } = await req.json()

    if (!channel || !to || !templateKey) {
      return NextResponse.json({ error: 'Missing required fields: channel, to, templateKey' }, { status: 400 })
    }

    const result = await sendNotification({ channel, to, templateKey, data: data || {} })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
