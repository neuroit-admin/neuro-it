'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Plus, Pencil, Trash2, Eye, EyeOff, Calendar, FileText, Sparkles } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/admin/blog')
      .then(res => res.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch blog posts:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentPublished }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update post status')
      }
      fetchPosts()
    } catch (err: any) {
      console.error('Toggle status error:', err)
      alert(err.message || 'Failed to toggle status.')
    }
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the blog post "${title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete post')
      }
      fetchPosts()
    } catch (err: any) {
      console.error('Delete post error:', err)
      alert(err.message || 'Failed to delete post.')
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>Blog</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
                Blog Post Management
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Create, edit, and publish SEO-optimized articles for your website.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href="/admin/blog/ai"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.25rem',
                  background: 'rgba(0, 210, 255, 0.1)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  borderRadius: '2px',
                  color: '#00D2FF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Sparkles size={16} /> AI Autopilot
              </Link>
              <Link
                href="/admin/blog/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.25rem',
                  background: '#00D2FF',
                  border: 'none',
                  borderRadius: '2px',
                  color: 'var(--bg-color)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <Plus size={16} /> New Post
              </Link>
            </div>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '2rem 0', fontFamily: 'var(--font-syne)', fontWeight: 600 }}>Loading blog posts...</div>
          ) : posts.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '3rem 1.5rem', textAlign: 'center' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No Blog Posts Found</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>Get started by creating your first article to attract search engine traffic.</p>
              <Link
                href="/admin/blog/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(0,210,255,0.1)',
                  border: '1px solid rgba(0,210,255,0.3)',
                  borderRadius: '2px',
                  color: '#00D2FF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Create First Post
              </Link>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1C1C1C', background: 'var(--surface)' }}>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>POST TITLE & SLUG</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CREATED</th>
                      <th style={{ textAlign: 'left', padding: '0.85rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PUBLISHED DATE</th>
                      <th style={{ textAlign: 'center', padding: '0.85rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>STATUS</th>
                      <th style={{ textAlign: 'right', padding: '0.85rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr
                        key={post.id}
                        style={{
                          borderBottom: '1px solid #1C1C1C',
                          background: post.published ? 'transparent' : 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <td style={{ padding: '1.25rem 1.5rem', verticalAlign: 'top' }}>
                          <div style={{ color: post.published ? '#E0E0E0' : '#888', fontWeight: 600, fontSize: '0.95rem' }}>{post.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                            <span className="font-mono" style={{ color: '#00D2FF', fontSize: '0.75rem' }}>
                              /blog/{post.slug}
                            </span>
                            {post.category && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', background: '#222', border: '1px solid #333', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                                {post.category.name}
                              </span>
                            )}
                            {post.tags && post.tags.split(',').map((tag: string) => (
                              <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                          {post.excerpt && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {post.excerpt}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={12} />
                            {new Date(post.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', verticalAlign: 'middle' }}>
                          {post.publishedAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Calendar size={12} />
                              {new Date(post.publishedAt).toLocaleDateString('en-GB')}
                            </div>
                          ) : (
                            <span style={{ color: '#555', fontStyle: 'italic' }}>Not Published</span>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          {post.published ? (
                            <span style={{ color: '#22C55E', fontSize: '0.75rem', background: 'rgba(34,197,94,0.1)', padding: '0.2rem 0.6rem', borderRadius: '2px', fontWeight: 600 }}>
                              Published
                            </span>
                          ) : (
                            <span style={{ color: '#F59E0B', fontSize: '0.75rem', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.6rem', borderRadius: '2px', fontWeight: 600 }}>
                              Draft
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleTogglePublish(post.id, post.published)}
                              title={post.published ? "Revert to Draft" : "Publish Now"}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', background: 'var(--surface-secondary)',
                                border: '1px solid #333', borderRadius: '4px',
                                color: post.published ? '#F59E0B' : '#22C55E',
                                cursor: 'pointer'
                              }}
                            >
                              {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <Link
                              href={`/admin/blog/edit/${post.id}`}
                              title="Edit Article"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', background: 'var(--surface-secondary)',
                                border: '1px solid #333', borderRadius: '4px', color: '#00D2FF',
                                cursor: 'pointer', textDecoration: 'none'
                              }}
                            >
                              <Pencil size={14} />
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              title="Delete Article"
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', background: 'var(--surface-secondary)',
                                border: '1px solid #333', borderRadius: '4px', color: '#EF4444',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
