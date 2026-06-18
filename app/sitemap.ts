import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://neuroit.co.uk'

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/services`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/how-it-works`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/areas`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/blog`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  // Dynamic: service categories
  let servicePages: MetadataRoute.Sitemap = []
  try {
    const categories = await prisma.serviceCategory.findMany({ where: { isActive: true } })
    servicePages = categories.map(cat => ({
      url: `${baseUrl}/services/${cat.slug}`,
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }))
  } catch {}

  // Dynamic: area pages
  let areaPages: MetadataRoute.Sitemap = []
  try {
    const areas = await prisma.coverageBorough.findMany({ where: { isActive: true } })
    areaPages = areas.map(area => ({
      url: `${baseUrl}/areas/${area.slug}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    }))
  } catch {}

  // Dynamic: blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    blogPages = posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      priority: 0.6,
      changeFrequency: 'weekly' as const,
    }))
  } catch {}

  return [...staticPages, ...servicePages, ...areaPages, ...blogPages]
}
