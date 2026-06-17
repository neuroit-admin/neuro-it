'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Sparkles, Wand2, Plus, Trash2, ArrowLeft, Check, AlertCircle, Loader2, FileText, FolderPlus, Tag } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useRouter } from 'next/navigation'

export default function AiAutopilotPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loadingCategories, setLoadingCategories] = useState(true)

  // AI Suggest Topics state
  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [topicType, setTopicType] = useState<'it-support' | 'tech-news' | 'ai-news'>('it-support')

  // AI Generate Post state
  const [customTopic, setCustomTopic] = useState('')
  const [customKeywords, setCustomKeywords] = useState('')
  const [generatingPost, setGeneratingPost] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<any | null>(null)
  
  // Save status
  const [savingPost, setSavingPost] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await fetch('/api/admin/blog/categories')
      const data = await res.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setNewCategoryName('')
        fetchCategories()
      } else {
        alert(data.error || 'Failed to create category')
      }
    } catch (err) {
      console.error('Create category error:', err)
      alert('An error occurred while creating the category')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return

    try {
      const res = await fetch(`/api/admin/blog/categories?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        fetchCategories()
      } else {
        alert(data.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Delete category error:', err)
      alert('An error occurred while deleting the category')
    }
  }

  const handleSuggestTopics = async () => {
    setLoadingTopics(true)
    setSuggestedTopics([])
    try {
      const res = await fetch('/api/admin/blog/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest-topics', topicType })
      })
      const data = await res.json()
      if (res.ok && data.topics) {
        setSuggestedTopics(data.topics)
      } else {
        alert(data.error || 'Failed to suggest topics. Please verify Gemini API key.')
      }
    } catch (err) {
      console.error('Suggest topics error:', err)
      alert('An error occurred while requesting Gemini AI topics')
    } finally {
      setLoadingTopics(false)
    }
  }

  const handleGeneratePost = async (topicTitle: string, keywords: string) => {
    setGeneratingPost(true)
    setGeneratedPost(null)
    try {
      const res = await fetch('/api/admin/blog/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-post',
          topic: topicTitle,
          targetKeywords: keywords
        })
      })
      const data = await res.json()
      if (res.ok && data.post) {
        setGeneratedPost(data.post)
        // Auto select first category if available
        if (categories.length > 0) {
          setSelectedCategory(categories[0].id)
        }
      } else {
        alert(data.error || 'Failed to generate article draft. Please verify Gemini API key.')
      }
    } catch (err) {
      console.error('Generate post error:', err)
      alert('An error occurred during content generation')
    } finally {
      setGeneratingPost(false)
    }
  }

  const handleSavePost = async () => {
    if (!generatedPost) return
    setSavingPost(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedPost.title,
          content: generatedPost.content,
          excerpt: generatedPost.excerpt,
          metaTitle: generatedPost.metaTitle,
          metaDescription: generatedPost.metaDescription,
          tags: generatedPost.tags,
          categoryId: selectedCategory || null,
          published: false // Saved as draft by default
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert('AI draft successfully generated and saved to Blog Post Management!')
        router.push('/admin/blog')
      } else {
        alert(data.error || 'Failed to save blog post')
      }
    } catch (err) {
      console.error('Save post error:', err)
      alert('An error occurred while saving the draft')
    } finally {
      setSavingPost(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '80px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
            <ChevronRight size={14} />
            <Link href="/admin/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#00D2FF' }}>AI Autopilot</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Sparkles size={28} style={{ color: '#00D2FF' }} />
            <h1 className="font-syne" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
              AI Blog Autopilot (Gemini Pro)
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', ... (generatedPost ? {} : { gridTemplateColumns: '7fr 5fr' }) }} className="grid-cols-1 md:grid-cols-layout">
            
            {/* Left side: AI Generation controls */}
            {!generatedPost ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Section A: Suggest Topics */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                    1. Automatic SEO Topic Planner
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                    Let Gemini analyze your local coverage areas and service catalog or browse latest trends to generate high-performing topic ideas.
                  </p>

                  {/* Topic Type Selector Tabs */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface-secondary)', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', width: 'fit-content' }}>
                    <button
                      type="button"
                      onClick={() => setTopicType('it-support')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: topicType === 'it-support' ? 'rgba(0,210,255,0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '2px',
                        color: topicType === 'it-support' ? '#00D2FF' : '#888',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      IT Support & Repairs
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicType('tech-news')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: topicType === 'tech-news' ? 'rgba(0,210,255,0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '2px',
                        color: topicType === 'tech-news' ? '#00D2FF' : '#888',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Hot Tech News
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopicType('ai-news')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: topicType === 'ai-news' ? 'rgba(0,210,255,0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '2px',
                        color: topicType === 'ai-news' ? '#00D2FF' : '#888',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      AI & Automation News
                    </button>
                  </div>

                  <button
                    onClick={handleSuggestTopics}
                    disabled={loadingTopics}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      background: 'rgba(0, 210, 255, 0.1)',
                      border: '1px solid rgba(0, 210, 255, 0.3)',
                      borderRadius: '2px',
                      color: '#00D2FF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {loadingTopics ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {loadingTopics ? 'Consulting Gemini...' : 'Suggest Hot Topics'}
                  </button>

                  {suggestedTopics.length > 0 && (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {suggestedTopics.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                              {item.title}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
                              {item.excerpt}
                            </p>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {item.targetKeywords?.split(',').map((kw: string) => (
                                <span key={kw} style={{ fontSize: '0.7rem', color: '#00D2FF', background: 'rgba(0,210,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                                  {kw.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleGeneratePost(item.title, item.targetKeywords)}
                            disabled={generatingPost}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.4rem 0.85rem',
                              background: '#00D2FF',
                              border: 'none',
                              borderRadius: '2px',
                              color: 'var(--bg-color)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Wand2 size={12} /> Write Draft
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Custom Topic Write */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                    2. Write Custom AI Article
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                    Have a specific topic in mind? Input your title and let Gemini write a comprehensive, search-optimized draft.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                        ARTICLE TOPIC OR TITLE
                      </label>
                      <input
                        type="text"
                        value={customTopic}
                        onChange={e => setCustomTopic(e.target.value)}
                        placeholder="e.g., The Ultimate Guide to Small Business Server Migrations in Barnet"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '2px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                        TARGET KEYWORDS (OPTIONAL - COMMA SEPARATED)
                      </label>
                      <input
                        type="text"
                        value={customKeywords}
                        onChange={e => setCustomKeywords(e.target.value)}
                        placeholder="e.g., server migration, london it support, business network setup"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '2px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleGeneratePost(customTopic, customKeywords)}
                    disabled={generatingPost || !customTopic.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      background: customTopic.trim() ? '#00D2FF' : '#222',
                      border: 'none',
                      borderRadius: '2px',
                      color: customTopic.trim() ? 'var(--bg-color)' : '#666',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: customTopic.trim() ? 'pointer' : 'default',
                    }}
                  >
                    {generatingPost ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    {generatingPost ? 'Generating Article...' : 'Generate Full Draft'}
                  </button>
                </div>
              </div>
            ) : (
              /* Generated Post Review Panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={20} style={{ color: '#22C55E' }} />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Draft Ready for Review</span>
                    </div>
                    <button
                      onClick={() => setGeneratedPost(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <ArrowLeft size={12} /> Back to Planner
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>TITLE</label>
                      <h2 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{generatedPost.title}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-1 md:grid-cols-2">
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>ASSIGN CATEGORY</label>
                        <select
                          value={selectedCategory}
                          onChange={e => setSelectedCategory(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '2px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        >
                          <option value="">No Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>TAGS (COMMA SEPARATED)</label>
                        <input
                          type="text"
                          value={generatedPost.tags || ''}
                          onChange={e => setGeneratedPost({ ...generatedPost, tags: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '2px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>EXCERPT</label>
                      <textarea
                        value={generatedPost.excerpt || ''}
                        onChange={e => setGeneratedPost({ ...generatedPost, excerpt: e.target.value })}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '2px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-1 md:grid-cols-2">
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>SEO META TITLE</label>
                        <input
                          type="text"
                          value={generatedPost.metaTitle || ''}
                          onChange={e => setGeneratedPost({ ...generatedPost, metaTitle: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '2px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>SEO META DESCRIPTION</label>
                        <input
                          type="text"
                          value={generatedPost.metaDescription || ''}
                          onChange={e => setGeneratedPost({ ...generatedPost, metaDescription: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'var(--surface-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '2px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>ARTICLE CONTENT (MARKDOWN)</label>
                      <textarea
                        value={generatedPost.content}
                        onChange={e => setGeneratedPost({ ...generatedPost, content: e.target.value })}
                        rows={16}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '2px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          lineHeight: '1.5',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        onClick={handleSavePost}
                        disabled={savingPost}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#00D2FF',
                          border: 'none',
                          borderRadius: '2px',
                          color: 'var(--bg-color)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {savingPost ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {savingPost ? 'Saving Draft...' : 'Save Draft to Website'}
                      </button>
                      
                      <button
                        onClick={() => setGeneratedPost(null)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'transparent',
                          border: '1px solid #333',
                          borderRadius: '2px',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Right side: Categories management (always visible when not in full review mode) */}
            {!generatedPost && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1.5rem' }}>
                  <h2 className="font-syne" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FolderPlus size={20} style={{ color: '#00D2FF' }} /> Categories
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.5rem' }}>
                    Organize your articles into public filters.
                  </p>

                  <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="e.g., Cybersecurity"
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        background: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '2px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#00D2FF',
                        border: 'none',
                        borderRadius: '2px',
                        color: 'var(--bg-color)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Add
                    </button>
                  </form>

                  {loadingCategories ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div style={{ color: '#555', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                      No categories created yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {categories.map(cat => (
                        <div
                          key={cat.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--surface-secondary)',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '2px',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                            {cat.name} <span style={{ color: '#555', fontSize: '0.75rem', marginLeft: '0.25rem' }}>({cat._count?.posts || 0} posts)</span>
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            disabled={cat._count?.posts > 0}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: cat._count?.posts > 0 ? '#333' : '#EF4444',
                              cursor: cat._count?.posts > 0 ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={cat._count?.posts > 0 ? "Cannot delete category with active posts" : "Delete Category"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Global CSS for responsive grid styling */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .grid-cols-layout {
            grid-template-columns: 7fr 5fr;
          }
        }
      `}</style>
    </>
  )
}
