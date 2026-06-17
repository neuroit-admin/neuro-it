import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate size (max 50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds limit (50MB)' }, { status: 400 })
    }

    // Validate MIME types and extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.gif']
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'image/jpg']

    const fileExtension = path.extname(file.name).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: 'Unsupported file extension' }, { status: 400 })
    }

    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    // Sanitize filename
    const cleanFilename = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()

    // Add unique identifier to prevent overwriting
    const cleanExtension = path.extname(cleanFilename)
    const baseName = path.basename(cleanFilename, cleanExtension)
    const uniqueFilename = `${baseName}-${Date.now()}${cleanExtension}`

    // Create target directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Write file
    const filePath = path.join(uploadDir, uniqueFilename)
    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${uniqueFilename}`
    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
