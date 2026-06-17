import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const label = formData.get('label') as string | null
    const tempSessionId = formData.get('tempSessionId') as string | null

    if (!file || !label || !tempSessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate size (max 5 MB)
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: 'File size exceeds 5 MB limit' }, { status: 400 })
    }

    // Validate MIME types
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Unsupported file format. Please upload JPEG, PNG, WebP or HEIC.' }, { status: 400 })
    }

    const sanitizedSessionId = (tempSessionId || '').replace(/[^a-zA-Z0-9_-]/g, '')
    const sanitizedLabel = (label || '').replace(/[^a-zA-Z0-9_-]/g, '')
    let ext = file.name.split('.').pop() || 'jpg'
    ext = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    const filename = `temp_${sanitizedSessionId}_${sanitizedLabel}.${ext}`

    const uploadDir = path.join(process.cwd(), 'uploads', 'temp')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    const url = `/api/tickets/photos/view/${filename}`

    return NextResponse.json({ url, label })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}
