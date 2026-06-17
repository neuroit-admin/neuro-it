import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DEFAULT_PAGES = [
  {
    slug: 'home',
    title: 'Home Page',
    metaTitle: 'Neuro IT — London Home IT Support & Tech Repair',
    metaDescription: 'Vetted home IT support engineers in London. Fast tech repair, network setups, virus removal, device backup. Book online in 2 minutes.',
    sections: JSON.stringify({
      heroTitle: 'Same-Day Home IT Support & Laptop Repairs in London',
      heroSubtitle: 'No automated phone loops, no hidden call-out surcharges. Vetted, certified engineers dispatched to your door or repaired in our central workshop.',
      primaryCtaText: 'Book a Free Diagnostic',
      whatsappCtaText: 'WhatsApp Us',
    }),
  },
  {
    slug: 'how-it-works',
    title: 'How It Works',
    metaTitle: 'How It Works — Neuro IT',
    metaDescription: 'Learn how Neuro IT delivers premium home IT support in London. Simple 4-stage customer journey from booking to repair completion.',
    sections: JSON.stringify({
      title: 'How It Works',
      subtitle: 'A transparent, professional, and rapid service from start to finish.',
      step1Title: '1. Quick Booking',
      step1Text: 'Select your service, check coverage, and pay a flat deposit or request travel-fee review.',
      step2Title: '2. Diagnostics',
      step2Text: 'Our vetted engineer arrives on-site or starts a remote session to diagnose the issue.',
      step3Title: '3. Quote & Confirm',
      step3Text: 'We agree on final pricing and parts with you before any repairs are carried out.',
      step4Title: '4. Repair & Handover',
      step4Text: 'We complete the work, test the device with you, and hand it over clean and fully functional.',
    }),
  },
]

async function ensureDefaultPages() {
  for (const dp of DEFAULT_PAGES) {
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: dp.slug },
    })
    if (!existing) {
      await prisma.cmsPage.create({
        data: dp,
      })
    }
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureDefaultPages()

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const page = await prisma.cmsPage.findUnique({
        where: { slug },
      })
      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      }
      return NextResponse.json({ page })
    }

    const pages = await prisma.cmsPage.findMany({
      orderBy: { slug: 'asc' },
    })
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Fetch CMS pages error:', error)
    return NextResponse.json({ error: 'Failed to fetch CMS pages' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slug, title, metaTitle, metaDescription, sections, isActive } = body

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (sections !== undefined) {
      // Validate JSON sections
      updateData.sections = typeof sections === 'string' ? sections : JSON.stringify(sections)
    }
    if (isActive !== undefined) updateData.isActive = isActive

    const page = await prisma.cmsPage.upsert({
      where: { slug },
      update: updateData,
      create: {
        slug,
        title: title || slug,
        metaTitle,
        metaDescription,
        sections: typeof sections === 'string' ? sections : JSON.stringify(sections || {}),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Update CMS page error:', error)
    return NextResponse.json({ error: 'Failed to update CMS page' }, { status: 500 })
  }
}
