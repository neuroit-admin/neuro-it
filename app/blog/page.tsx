import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, ArrowRight, BookOpen, Tag } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Expert IT Support & Computer Repair Blog | Neuro IT',
  description: 'Read the Neuro IT blog for professional IT support tips, home cybersecurity advice, laptop repair guides, and technology insights in London.',
  alternates: {
    canonical: 'https://neuro-it.co.uk/blog',
  },
}

// Helper to estimate reading time
function getReadingTime(text: string): string {
  const wordsPerMinute = 200
  const noOfWords = text.split(/\s+/).length
  const minutes = Math.ceil(noOfWords / wordsPerMinute)
  return `${minutes} min read`
}

export default async function BlogIndexPage(props: {
  searchParams: Promise<{ category?: string }>
}) {
  const searchParams = await props.searchParams
  const selectedCategorySlug = searchParams.category

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        published: true,
        ...(selectedCategorySlug
          ? { category: { slug: selectedCategorySlug } }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  // JSON-LD schema for Blog
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'Neuro IT Support & Repair Blog',
    'description': 'Expert computer repair guides, home office cybersecurity steps, and IT cost breakdown in London.',
    'publisher': {
      '@type': 'LocalBusiness',
      'name': 'Neuro IT',
      'image': 'https://neuro-it.co.uk/assets/logo.png',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'London',
        'addressCountry': 'GB',
      },
      'priceRange': '££',
      'telephone': '02000000000',
    },
    'blogPost': posts.map(post => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.excerpt || post.metaDescription,
      'url': `https://neuro-it.co.uk/blog/${post.slug}`,
      'datePublished': post.publishedAt?.toISOString(),
      'dateModified': post.updatedAt?.toISOString(),
      'author': {
        '@type': 'Organization',
        'name': 'Neuro IT',
      },
    })),
  }

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#00D2FF', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-syne)' }}>
              Resources & Insights
            </span>
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '3rem', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              The Neuro IT <span style={{ color: '#00D2FF' }}>Blog</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Expert technology advice, troubleshooting guides, and security tips straight from our field engineers in London.
            </p>
          </div>

          {/* Category Filter Tabs */}
          {categories.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '3rem',
              padding: '0.5rem',
              background: 'var(--surface)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '999px',
              maxWidth: 'fit-content',
              margin: '0 auto 3rem auto'
            }}>
              <Link
                href="/blog"
                style={{
                  background: !selectedCategorySlug ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: !selectedCategorySlug ? '#00D2FF' : 'transparent',
                  borderRadius: '999px',
                  padding: '0.5rem 1.25rem',
                  color: !selectedCategorySlug ? '#00D2FF' : '#888',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: !selectedCategorySlug ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none'
                }}
              >
                All Articles
              </Link>
              {categories.map(cat => {
                const isActive = selectedCategorySlug === cat.slug
                return (
                  <Link
                    key={cat.id}
                    href={`/blog/category/${cat.slug}`}
                    style={{
                      background: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? '#00D2FF' : 'transparent',
                      borderRadius: '999px',
                      padding: '0.5rem 1.25rem',
                      color: isActive ? '#00D2FF' : '#888',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 15px rgba(0, 210, 255, 0.15)' : 'none'
                    }}
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Posts list */}
          {posts.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center' }}>
              <BookOpen size={48} style={{ color: '#444', marginBottom: '1.5rem' }} />
              <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Articles Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                There are no published articles {selectedCategorySlug ? 'in this category' : 'yet'}.
              </p>
              {selectedCategorySlug && (
                <Link
                  href="/blog"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#00D2FF',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  View All Articles <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
              {posts.map((post, idx) => {
                const dateString = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : ''
                const readTime = getReadingTime(post.content)

                return (
                  <article
                    key={post.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '2.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Subtle design element */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: idx === 0 && !selectedCategorySlug ? '#00D2FF' : 'transparent',
                    }} />

                    {/* Metadata row */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
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
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <h2
                        className="font-syne"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: 800,
                          fontSize: '1.75rem',
                          margin: 0,
                          lineHeight: 1.3,
                          transition: 'color 0.2s ease',
                          cursor: 'pointer',
                        }}
                      >
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        {post.excerpt}
                      </p>
                    )}

                    {/* Footer Row: Read More & Tags */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginTop: '0.5rem',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '1.25rem'
                    }}>
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#00D2FF',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-syne)',
                        }}
                      >
                        Read Full Article <ArrowRight size={14} />
                      </Link>

                      {post.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {post.tags.split(',').map(tag => {
                            const trimmed = tag.trim()
                            if (!trimmed) return null
                            return (
                              <span
                                key={trimmed}
                                style={{
                                  background: 'var(--surface-secondary)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  color: '#A0A0A0',
                                  fontSize: '0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <Tag size={10} style={{ color: '#00D2FF' }} />
                                {trimmed}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
