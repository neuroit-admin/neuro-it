import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  props: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await props.params

    if (filename.includes('..') || path.isAbsolute(filename)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    let filePath = ''
    if (filename.startsWith('temp_')) {
      filePath = path.join(process.cwd(), 'uploads', 'temp', filename)
      // Temp files are accessed during booking, where session may not exist yet.
      // Having the exact unguessable UUID-based temp filename acts as access control.
    } else {
      filePath = path.join(process.cwd(), 'uploads', 'tickets', filename)

      // Access control for ticket photos and shipping labels
      const session = await getServerSession(authOptions)
      const { searchParams } = new URL(req.url)
      const token = searchParams.get('token')

      let isAuthorized = false

      if (session?.user && (session.user as any).role === 'ADMIN') {
        isAuthorized = true
      } else {
        if (filename.startsWith('shipping_label_')) {
          const ticketId = filename.replace('shipping_label_', '').split('.')[0]
          const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
          })

          if (ticket) {
            if (token && ticket.securityToken === token) {
              isAuthorized = true
            } else if (session?.user && ticket.customerId === (session.user as any).id) {
              isAuthorized = true
            }
          }
        } else {
          // Device Photo
          const photoId = filename.split('.')[0]
          const photoRecord = await prisma.devicePhoto.findUnique({
            where: { id: photoId },
            include: { ticket: true },
          })

          if (photoRecord) {
            if (token && photoRecord.ticket.securityToken === token) {
              isAuthorized = true
            } else if (session?.user && photoRecord.ticket.customerId === (session.user as any).id) {
              isAuthorized = true
            }
          }
        }
      }

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'

    let contentType = 'image/jpeg'
    if (ext === 'png') contentType = 'image/png'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'heic') contentType = 'image/heic'
    else if (ext === 'pdf') contentType = 'application/pdf'

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
