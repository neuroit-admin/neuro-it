import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent'

async function fetchTechNews(type: 'tech' | 'ai'): Promise<string> {
  const url = type === 'ai' 
    ? 'https://venturebeat.com/category/ai/feed/' 
    : 'https://techcrunch.com/feed/'
    
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return ''
    const text = await res.text()
    
    const items: { title: string; description: string }[] = []
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g)
    
    if (itemMatches) {
      for (const item of itemMatches.slice(0, 8)) {
        const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/)
        const descMatch = item.match(/<description>([\s\S]*?)<\/description>/)
        
        let title = titleMatch ? titleMatch[1] : ''
        let desc = descMatch ? descMatch[1] : ''
        
        title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        desc = desc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
        desc = desc.replace(/<[^>]*>?/gm, '').slice(0, 150)
        
        if (title) {
          items.push({ title, description: desc })
        }
      }
    }
    
    return items.map((it, idx) => `${idx + 1}. Title: ${it.title}\n   Summary: ${it.description}`).join('\n\n')
  } catch (err) {
    console.error('Failed to fetch tech news feed:', err)
    return ''
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API Key is not configured in .env.local' }, { status: 500 })
  }

  try {
    const { action, topic, targetKeywords, topicType } = await req.json()

    // Fetch services and coverage boroughs from database to guide the AI
    const services = await prisma.service.findMany({ select: { name: true } })
    const areas = await prisma.coverageBorough.findMany({ select: { name: true } })

    const servicesList = services.map(s => s.name).join(', ')
    const areasList = areas.map(a => a.name).join(', ')

    if (action === 'suggest-topics') {
      let typeFocus = 'solving a specific IT problem (e.g., wifi dead zones, server migrations, cyber threats) and tie in naturally with our services and locations.'
      let freshNewsContext = ''

      if (topicType === 'tech-news') {
        typeFocus = 'hot technology news, recent global technology trends, gadget/hardware releases, or major tech industry updates and explain what they mean for consumers.'
        const news = await fetchTechNews('tech')
        if (news) {
          freshNewsContext = `\nHere are the latest live global technology news headlines from today to base your topics on:\n\n${news}\n\nUse these fresh news events to suggest highly relevant, timely topics.`
        }
      } else if (topicType === 'ai-news') {
        typeFocus = 'the latest breakthroughs, news, tools, and trends in Artificial Intelligence (e.g., LLMs, upgrades, AI automation, generative tools) and how businesses or professionals can use them to work smarter.'
        const news = await fetchTechNews('ai')
        if (news) {
          freshNewsContext = `\nHere are the latest live AI news headlines from today to base your topics on:\n\n${news}\n\nUse these fresh news events to suggest highly relevant, timely topics.`
        }
      }

      const prompt = `You are a professional SEO copywriter for "Neuro IT", a premium IT Support & Network Installations provider in London.
Our main services are: [${servicesList}].
We operate in these London boroughs: [${areasList}].

Suggest 5 highly engaging, SEO-optimized blog post topics. The category focus should be: ${typeFocus}
Make sure they target local London business owners or tech-savvy readers.
${freshNewsContext}

Return ONLY a JSON array of objects. Do not include any markdown styling like \`\`\`json.
Each object in the array MUST have exactly these fields:
- "title": An engaging, professional, and SEO-optimized title.
- "slug": A clean URL-friendly slug based on the title.
- "excerpt": A 1-2 sentence teaser/summary of what the article will cover.
- "targetKeywords": A comma-separated list of 3-4 target keywords.`

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${errorText}`)
      }

      const resData = await response.json()
      const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text
      const topics = JSON.parse(textResult)

      return NextResponse.json({ topics })
    }

    if (action === 'generate-post') {
      if (!topic) {
        return NextResponse.json({ error: 'Topic is required to generate a post' }, { status: 400 })
      }

      const prompt = `You are a professional technical SEO writer for "Neuro IT", a premium IT Support & Network Installations provider in London.
Our main services are: [${servicesList}].
We operate in these London boroughs: [${areasList}].

Write a comprehensive, professional, and highly engaging blog post about the topic: "${topic}".
${targetKeywords ? `Primary keywords to target: [${targetKeywords}].` : ''}

Writing guidelines:
- Tone of Voice: Professional, trustworthy, technically authoritative, yet easy to understand for business owners.
- Length: Around 800 - 1200 words.
- Format: Use Markdown. Use H2 and H3 headings, bold text, bullet points, and numbered lists.
- Media Embeds: Include at least 1 or 2 relevant high-quality images in the markdown content. Use direct Unsplash URLs with query terms related to the paragraph topic, formatted as standard Markdown images, e.g. ![Alt Description](https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=60) (where 1531297484001-80022131f5a1 is a tech/workspace photo ID or use other valid, stable Unsplash IDs like 1518770660439-4636190af475 (microchip), 1588508065123 (laptop repair), 1544244015-0df4b3ffc6b0 (tablet/iPad), 1562408590-e32931084e23 (networking routers)). If relevant, embed a short HTML5 video player e.g. <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls style="max-width: 100%; border-radius: 4px; margin: 1rem 0;"></video> inside the article body.
- Internal Linking: Naturally mention and link to at least 2 services from our list (use HTML links, e.g. <a href="/services/post-slug" style="color: #00D2FF; text-decoration: underline;">Service Name</a>. Note: the actual service page slugs are lowercase, space replaced by hyphen, e.g., /services/home-it-support).
- Local Authority: Reference at least one of our operating London boroughs (e.g., Enfield, Barnet, Islington) to build local relevance.
- File attachment: If relevant, suggest a downloadable checklist or guide (e.g. "Download our Cybersecurity checklist") and represent it as a styled download link/button.

Return ONLY a JSON object. Do not include any markdown styling like \`\`\`json.
The JSON object MUST have exactly these fields:
- "title": The title of the article.
- "content": The full blog post body in Markdown format with embedded images and/or videos.
- "excerpt": A short 1-2 sentence teaser/summary (max 150 chars).
- "metaTitle": An SEO meta title (50-60 characters) ending with "| Neuro IT".
- "metaDescription": A compelling SEO meta description (150-160 characters) with a call to action.
- "tags": A comma-separated list of 4-5 relevant tags (lowercase, e.g., "cybersecurity, london business, it support").`

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${errorText}`)
      }

      const resData = await response.json()
      const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text
      const postData = JSON.parse(textResult)

      return NextResponse.json({ post: postData })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Gemini AI generate error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 })
  }
}
