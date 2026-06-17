import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: Request,
  props: { params: Promise<{ filename: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { filename } = await props.params

    if (filename.includes('..') || path.isAbsolute(filename)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    let filePath = ''
    if (filename.startsWith('temp_')) {
      filePath = path.join(process.cwd(), 'uploads', 'temp', filename)
    } else {
      filePath = path.join(process.cwd(), 'uploads', 'tickets', filename)
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
