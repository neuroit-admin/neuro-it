'use client'

import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, Save, X, Eye, Paperclip, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function AdminEditBlogPost() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')

  const [categories, setCategories] = useState<any[]>([])
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Fetch categories
    fetch('/api/admin/blog/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err))
  }, [])

  useEffect(() => {
    if (!id) return

    fetch(`/api/admin/blog/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error)
        } else if (data.post) {
          setTitle(data.post.title || '')
          setSlug(data.post.slug || '')
          setContent(data.post.content || '')
          setExcerpt(data.post.excerpt || '')
          setMetaTitle(data.post.metaTitle || '')
          setMetaDescription(data.post.metaDescription || '')
          setPublished(data.post.published || false)
          setCategoryId(data.post.categoryId || '')
          setTags(data.post.tags || '')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load blog post:', err)
        setErrorMsg('Failed to load blog post.')
        setLoading(false)
      })
  }, [id])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      // Auto append appropriate markdown depending on file type
      let markdownToAppend = ''
      if (file.type.startsWith('image/')) {
        markdownToAppend = `\n\n![${file.name}](${data.url})`
      } else if (file.type.startsWith('video/')) {
        markdownToAppend = `\n\n<video src="${data.url}" controls style="max-width: 100%; border-radius: 4px; margin: 1rem 0;"></video>`
      } else {
        markdownToAppend = `\n\n[Download ${file.name}](${data.url})`
      }

      setContent(prev => prev + markdownToAppend)
      alert(`File "${file.name}" uploaded successfully! Link inserted.`)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to upload file.')
    } finally {
      setUploadLoading(false)
    }
  }

  const parseMarkdown = (md: string) => {
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

    html = html.replace(/^#\s+(.*?)$/gm, '<h1 style="color: #FFF; font-size: 1.6rem; font-weight: 800; margin: 1.5rem 0 1rem;">$1</h1>')
    html = html.replace(/^##\s+(.*?)$/gm, '<h2 style="color: #FFF; font-size: 1.3rem; font-weight: 700; margin: 1.5rem 0 1rem; border-bottom: 1px solid #222; padding-bottom: 0.3rem;">$1</h2>')
    html = html.replace(/^###\s+(.*?)$/gm, '<h3 style="color: #FFF; font-size: 1.1rem; font-weight: 600; margin: 1.25rem 0 0.75rem;">$1</h3>')

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
      return `<p style="margin-bottom: 1rem; line-height: 1.6; color: #CCCCCC;">${p}</p>`
    }).join('')

    return html
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          published,
          categoryId: categoryId || null,
          tags: tags || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update blog post')

      router.push('/admin/blog')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error updating blog post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <Link href="/admin/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>Edit Post</span>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>
                Edit Blog Post
              </h2>
            </div>

            {loading ? (
              <div style={{ color: 'var(--text-muted)', padding: '3rem 1.5rem', textAlign: 'center' }}>Loading blog post data...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {errorMsg && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Title & Slug */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-1 md:grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Article Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => {
                        setTitle(e.target.value)
                        const currentAutoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                        if (!slug || slug === currentAutoSlug) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                        }
                      }}
                      placeholder="e.g. How to Repair a Broken Laptop Screen"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                      placeholder="laptop-screen-repair-guide"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                {/* Category & Tags */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-1 md:grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="e.g. cybersecurity, support, london"
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Excerpt / Short Summary</label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="Provide a brief summary of the article. This appears on the blog index and search results."
                    style={{
                      width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                      borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Content Body with Tabbed Preview and Media Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditorTab('write')}
                        style={{
                          padding: '0.4rem 1rem',
                          background: editorTab === 'write' ? 'rgba(0,210,255,0.1)' : 'transparent',
                          border: '1px solid',
                          borderColor: editorTab === 'write' ? '#00D2FF' : '#333',
                          borderRadius: '2px',
                          color: editorTab === 'write' ? '#00D2FF' : '#888',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('preview')}
                        style={{
                          padding: '0.4rem 1rem',
                          background: editorTab === 'preview' ? 'rgba(0,210,255,0.1)' : 'transparent',
                          border: '1px solid',
                          borderColor: editorTab === 'preview' ? '#00D2FF' : '#333',
                          borderRadius: '2px',
                          color: editorTab === 'preview' ? '#00D2FF' : '#888',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Preview
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.4rem 0.85rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid #333',
                          borderRadius: '2px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: uploadLoading ? 'default' : 'pointer'
                        }}
                      >
                        {uploadLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Paperclip size={14} />
                        )}
                        <span>{uploadLoading ? 'Uploading...' : 'Upload Media/File'}</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={uploadLoading}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {editorTab === 'write' ? (
                    <textarea
                      rows={15}
                      required
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="# Enter your markdown text here..."
                      style={{
                        width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                        fontFamily: 'monospace', lineHeight: '1.5'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%', minHeight: '340px', padding: '1.25rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                        borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.95rem', overflowY: 'auto', maxHeight: '500px'
                      }}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                    />
                  )}
                </div>

                {/* SEO Tags */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <h3 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    SEO Metadata (Optional Override)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-1 md:grid-cols-2">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Meta Title</label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={e => setMetaTitle(e.target.value)}
                        placeholder={title || 'Defaults to Article Title'}
                        style={{
                          width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Meta Description</label>
                      <input
                        type="text"
                        value={metaDescription}
                        onChange={e => setMetaDescription(e.target.value)}
                        placeholder={excerpt || 'Defaults to Excerpt Summary'}
                        style={{
                          width: '100%', padding: '0.75rem', background: 'var(--surface-secondary)', border: '1px solid var(--border)',
                          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={e => setPublished(e.target.checked)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span>Publish article (Make active on public website)</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <Link
                    href="/admin/blog"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.6rem 1.25rem',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: '2px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    <X size={14} /> Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.5rem',
                      background: '#00D2FF',
                      border: 'none',
                      borderRadius: '2px',
                      color: 'var(--bg-color)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    <Save size={14} /> {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
