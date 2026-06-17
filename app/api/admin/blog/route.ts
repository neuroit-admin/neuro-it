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
    const posts = await prisma.blogPost.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Admin get blog posts error:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, slug, content, excerpt, metaTitle, metaDescription, ogImage, published, categoryId, tags } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    let generatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Ensure slug is unique
    const existing = await prisma.blogPost.findUnique({
      where: { slug: generatedSlug },
    })

    if (existing) {
      generatedSlug = `${generatedSlug}-${Date.now()}`
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        content,
        excerpt: excerpt || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || null,
        ogImage: ogImage || null,
        published: !!published,
        publishedAt: published ? new Date() : null,
        categoryId: categoryId || null,
        tags: tags || null,
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Admin create blog post error:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}
