import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, ArrowLeft, ArrowRight, Wrench, Shield, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

// Estimated reading time helper
function getReadingTime(text: string): string {
  const wordsPerMinute = 200
  const noOfWords = text.split(/\s+/).length
  const minutes = Math.ceil(noOfWords / wordsPerMinute)
  return `${minutes} min read`
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  })

  if (!post) return { title: 'Post Not Found | Neuro IT' }

  return {
    title: `${post.metaTitle || post.title} | Neuro IT`,
    description: post.metaDescription || post.excerpt || 'Neuro IT Support & Repair Blog Article',
    alternates: {
      canonical: `https://neuroit.co.uk/blog/${post.slug}`,
    },
  }
}

// Unified HTML Markdown Parser
function parseMarkdown(md: string) {
  if (!md) return ''
  
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  html = html
    .replace(/&lt;video([\s\S]*?)&gt;([\s\S]*?)&lt;\/video&gt;/g, "<video$1>$2</video>")
    .replace(/&lt;video([\s\S]*?)&gt;/g, "<video$1>")
    .replace(/&lt;a([\s\S]*?)&gt;([\s\S]*?)&lt;\/a&gt;/g, "<a$1>$2</a>")
    .replace(/&lt;iframe([\s\S]*?)&gt;([\s\S]*?)&lt;\/iframe&gt;/g, "<iframe$1>$2</iframe>")

  // Generate IDs for headings to support Table of Contents anchor links
  html = html.replace(/^##\s+(.*?)$/gm, (match, titleText) => {
    const id = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `<h2 id="${id}" style="color: #FFF; font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; border-bottom: 1px solid #222; padding-bottom: 0.3rem; scroll-margin-top: 100px; font-family: var(--font-syne);">${titleText}</h2>`
  })
  
  html = html.replace(/^###\s+(.*?)$/gm, (match, titleText) => {
    const id = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `<h3 id="${id}" style="color: #FFF; font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.75rem; scroll-margin-top: 100px; font-family: var(--font-syne);">${titleText}</h3>`
  })

  html = html.replace(/^#\s+(.*?)$/gm, '<h1 style="color: #FFF; font-size: 1.8rem; font-weight: 800; margin: 1.5rem 0 1rem; font-family: var(--font-syne);">$1</h1>')

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 4px; border: 1px solid #2A2A2A; margin: 1rem 0;" />')
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #00D2FF; text-decoration: underline;">$1</a>')

  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li style="margin-left: 1.5rem; list-style-type: disc; margin-bottom: 0.4rem; color: #CCC;">$1</li>')
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li style="margin-left: 1.5rem; list-style-type: decimal; margin-bottom: 0.4rem; color: #CCC;">$1</li>')

  html = html.replace(/^&gt;\s+(.*?)$/gm, '<blockquote style="border-left: 3px solid #00D2FF; padding-left: 1rem; color: #888; font-style: italic; margin: 1rem 0;">$1</blockquote>')
  html = html.replace(/`([^`]+)`/g, '<code style="font-family: monospace; background: #222; padding: 0.1rem 0.3rem; border-radius: 3px; color: #FF79C6;">$1</code>')

  html = html.split(/\n{2,}/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<blockquote') || p.trim().startsWith('<video')) {
      return p
    }
    return `<p style="margin-bottom: 1rem; line-height: 1.75; color: #CCCCCC; font-size: 1.05rem;">${p}</p>`
  }).join('')

  return html
}

// Extract Table of Contents items
function getTableOfContents(content: string) {
  const lines = content.split('\n')
  const toc: { text: string; id: string; level: number }[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc.push({ text, id, level: 2 })
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      toc.push({ text, id, level: 3 })
    }
  })
  
  return toc
}

export default async function BlogPostDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      category: true
    }
  })

  if (!post) {
    notFound()
  }

  const dateString = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : ''
  const readTime = getReadingTime(post.content)
  const toc = getTableOfContents(post.content)

  // Fetch related articles in the same category
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
      ...(post.categoryId ? { categoryId: post.categoryId } : {})
    },
    take: 3,
    include: {
      category: true,
    },
    orderBy: { publishedAt: 'desc' }
  })

  // Fallback if less than 3 related posts are found
  let fallbackRelated: any[] = []
  if (relatedPosts.length < 3) {
    fallbackRelated = await prisma.blogPost.findMany({
      where: {
        published: true,
        id: {
          notIn: [post.id, ...relatedPosts.map(p => p.id)]
        }
      },
      take: 3 - relatedPosts.length,
      include: {
        category: true,
      },
      orderBy: { publishedAt: 'desc' }
    })
  }
  const allRelatedPosts = [...relatedPosts, ...fallbackRelated]

  // Fetch all active services for dynamic keyword relevance matching
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    include: { category: true }
  })

  // Combine blog post texts for text scanning
  const postTextForMatching = `${post.title} ${post.excerpt || ''} ${post.tags || ''} ${post.content}`.toLowerCase()

  // Score each service based on frequency and exact match occurrences
  const scoredServices = allServices.map(svc => {
    let score = 0
    const nameLower = svc.name.toLowerCase()
    const catNameLower = svc.category.name.toLowerCase()

    // High priority: exact phrase match of service name or slug in blog post
    if (postTextForMatching.includes(nameLower)) {
      score += 10
    }
    if (postTextForMatching.includes(svc.slug.toLowerCase())) {
      score += 8
    }

    // Medium priority: exact phrase match of category name or slug in blog post
    if (postTextForMatching.includes(catNameLower)) {
      score += 5
    }
    if (postTextForMatching.includes(svc.category.slug.toLowerCase())) {
      score += 4
    }

    // Lower priority: match individual words of service name (length > 3)
    const nameWords = nameLower.split(/\s+/)
    nameWords.forEach(word => {
      if (word.length > 3 && postTextForMatching.includes(word)) {
        score += 2
      }
    })

    // Match individual words of category name (length > 3)
    const catWords = catNameLower.split(/\s+/)
    catWords.forEach(word => {
      if (word.length > 3 && postTextForMatching.includes(word)) {
        score += 1
      }
    })

    return { service: svc, score }
  })

  // Sort services by score (descending), filter out zero scores, and select top 3
  const relatedMatchedServices = scoredServices
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service)

  // Fallback to active services if fewer than 3 matches are found
  let services = relatedMatchedServices.slice(0, 3)
  if (services.length < 3) {
    const fallbackServices = allServices.filter(
      svc => !services.some(s => s.id === svc.id)
    )
    services = [...services, ...fallbackServices.slice(0, 3 - services.length)]
  }

  // Article Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': post.title,
    'description': post.excerpt || post.metaDescription,
    'datePublished': post.publishedAt?.toISOString(),
    'dateModified': post.updatedAt?.toISOString(),
    'url': `https://neuroit.co.uk/blog/${post.slug}`,
    'image': post.ogImage || 'https://neuroit.co.uk/assets/blog-placeholder.png',
    'author': {
      '@type': 'Organization',
      'name': 'Neuro IT',
      'url': 'https://neuroit.co.uk',
    },
    'publisher': {
      '@type': 'LocalBusiness',
      'name': 'Neuro IT',
      'image': 'https://neuroit.co.uk/assets/logo.png',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'London',
        'addressCountry': 'GB',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Back button */}
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              marginBottom: '2rem',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Article Header */}
          <header style={{ marginBottom: '3rem' }}>
            <h1
              className="font-syne"
              style={{
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '2.5rem',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
              }}
            >
              {post.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              {post.category && (
                <span style={{
                  background: 'rgba(0, 210, 255, 0.1)',
                  border: '1px solid rgba(0, 210, 255, 0.2)',
                  color: '#00D2FF',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {post.category.name}
                </span>
              )}
              {dateString && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} style={{ color: '#00D2FF' }} />
                  <time dateTime={post.publishedAt?.toISOString()}>{dateString}</time>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} style={{ color: '#00D2FF' }} />
                <span>{readTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>By</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Neuro IT Editorial Team</span>
              </div>
            </div>
          </header>

          {/* Main layout grid (70% content, 30% sidebar) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '3rem', alignItems: 'start' }} className="grid-cols-1 lg:grid-cols-[1fr_280px]">
            {/* Content area */}
            <article>
              <div
                dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
                className="blog-content"
              />

              {/* Social Share Widget */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2.5rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Share Article:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={`https://twitter.com/intent/tweet?url=https://neuroit.co.uk/blog/${post.slug}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=https://neuroit.co.uk/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: '#00D2FF',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://neuroit.co.uk/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: '#4267B2',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' - https://neuroit.co.uk/blog/' + post.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: '#25D366',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Call-to-action banner at end of post */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(0,210,255,0.05) 0%, rgba(0,0,0,0) 100%)',
                  border: '1px solid rgba(0, 210, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '2rem',
                  marginTop: '4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>
                  Need Professional IT Assistance?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                  Don&apos;t waste hours struggling with network settings or software bugs. Our vetted, local London technicians can resolve your issue today.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <Link
                    href={services.length > 0 ? `/book?service=${services[0].slug}&cat=${services[0].category.slug}` : '/book'}
                    style={{
                      background: '#00D2FF',
                      color: 'var(--bg-color)',
                      padding: '0.6rem 1.25rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-syne)',
                      fontSize: '0.85rem',
                      borderRadius: '2px',
                      textDecoration: 'none',
                    }}
                  >
                    Book a Repair Visit
                  </Link>
                  <Link
                    href="/how-it-works"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      border: '1px solid #333',
                      padding: '0.6rem 1.25rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-syne)',
                      fontSize: '0.85rem',
                      borderRadius: '2px',
                      textDecoration: 'none',
                    }}
                  >
                    How It Works
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar with Table of Contents, related services and popular areas */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
              
              {/* Table of Contents */}
              {toc.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                  <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Table of Contents
                  </h4>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {toc.map(item => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="hover:text-[#00D2FF] transition-colors duration-200"
                        style={{
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          paddingLeft: item.level === 3 ? '1rem' : '0',
                          lineHeight: '1.4'
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Popular Services Grid */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={14} style={{ color: '#00D2FF' }} /> Related Services
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {services.map(svc => (
                    <Link
                      key={svc.id}
                      href={`/services/${svc.category.slug}`}
                      className="hover:text-[#00D2FF] transition-colors duration-200"
                      style={{
                        color: '#B0B0B0',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        display: 'block',
                      }}
                    >
                      • {svc.name}
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    style={{
                      color: '#00D2FF',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                      display: 'block',
                    }}
                  >
                    View All Services →
                  </Link>
                </div>
              </div>

              {/* Supported London Areas List */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} style={{ color: '#00D2FF' }} /> Service Coverage
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 0.75rem' }}>
                  We provide home IT support and certified technicians across these key boroughs:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { slug: 'hackney', name: 'Hackney' },
                    { slug: 'camden', name: 'Camden' },
                    { slug: 'islington', name: 'Islington' },
                    { slug: 'enfield', name: 'Enfield' },
                    { slug: 'haringey', name: 'Haringey' },
                    { slug: 'barnet', name: 'Barnet' },
                  ].map(area => (
                    <Link
                      key={area.slug}
                      href={`/areas/${area.slug}`}
                      className="hover:text-[#00D2FF] transition-colors duration-200"
                      style={{
                        color: '#B0B0B0',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                      }}
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/areas"
                  style={{
                    color: '#00D2FF',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginTop: '0.75rem',
                    display: 'block',
                  }}
                >
                  View All Coverage Areas →
                </Link>
              </div>

            </aside>
          </div>

          {/* Related Articles Bottom Grid */}
          {allRelatedPosts.length > 0 && (
            <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '2rem' }}>
                Related <span style={{ color: '#00D2FF' }}>Articles</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {allRelatedPosts.map(rp => {
                  const rpReadTime = getReadingTime(rp.content)
                  return (
                    <div
                      key={rp.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {rp.category && (
                          <span style={{ color: '#00D2FF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            {rp.category.name}
                          </span>
                        )}
                        <span style={{ color: '#555', fontSize: '0.75rem' }}>
                          {rpReadTime}
                        </span>
                      </div>
                      <Link href={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                        <h4 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: 0, lineHeight: '1.4' }}>
                          {rp.title}
                        </h4>
                      </Link>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>
                        {rp.excerpt || (rp.content.slice(0, 100) + '...')}
                      </p>
                      <Link
                        href={`/blog/${rp.slug}`}
                        style={{
                          color: '#00D2FF',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: 'auto'
                        }}
                      >
                        Read More <ArrowRight size={12} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}

