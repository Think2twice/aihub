import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Parser from 'rss-parser'
import slugify from 'slugify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'AI-Hub-Maintenance/1.0',
  },
})

const RSS_SOURCES = [
  { name: '量子位', url: 'https://www.qbitai.com/rss' },
  { name: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
]

function stripHtml(input: string): string {
  return input
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
    .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(p|br|li|h[1-6]|div|blockquote)[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeSummary(input: string, maxLength = 320): string {
  const text = stripHtml(input)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

function makeSlug(title: string, publishedAt: Date): string {
  const datePart = publishedAt.toISOString().slice(0, 10).replace(/-/g, '')
  const titlePart = slugify(title.slice(0, 60), { lower: true, strict: true })
  const fallback = Buffer.from(title).toString('hex').slice(0, 16)
  return `${datePart}-${titlePart || fallback}`
}

async function importNews(limitPerSource: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 21)

  let imported = 0
  let skipped = 0
  const failedSources: Array<{ name: string; error: string }> = []

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      const recentItems = (feed.items || [])
        .filter((item) => {
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()
          return Number.isFinite(publishedAt.getTime()) && publishedAt >= cutoff
        })
        .slice(0, limitPerSource)

      for (const item of recentItems) {
        const title = item.title?.trim()
        const sourceUrl = item.link?.trim()
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()

        if (!title || !sourceUrl || !Number.isFinite(publishedAt.getTime())) {
          skipped++
          continue
        }

        const slug = makeSlug(title, publishedAt)
        const existing = await prisma.news.findUnique({ where: { slug } })
        if (existing) {
          skipped++
          continue
        }

        const rawContent = (item as any)['content:encoded'] || item.content || item.summary || item.contentSnippet || title
        const summary = makeSummary(rawContent)
        const content = stripHtml(rawContent) || summary || title

        await prisma.news.create({
          data: {
            title,
            slug,
            summary,
            content: content.slice(0, 2000),
            sourceName: source.name,
            sourceUrl,
            publishedAt,
            isAutoCrawled: true,
            viewCount: 0,
          },
        })

        imported++
      }
    } catch (error: any) {
      failedSources.push({ name: source.name, error: error?.message || String(error) })
    }
  }

  const total = await prisma.news.count()
  return { imported, skipped, failedSources, total }
}

async function recordTrendSnapshot() {
  const tools = await prisma.tool.findMany({
    where: { status: 'approved', isActive: true },
    orderBy: [{ viewCount: 'desc' }, { stars: 'desc' }],
    select: { id: true, upvotes: true, viewCount: true, stars: true },
  })

  const today = new Date().toISOString().slice(0, 10)
  let recorded = 0

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i]
    await prisma.$executeRawUnsafe(
      `INSERT INTO tool_trend_histories ("toolId", date, upvotes, "viewCount", stars, rank, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT ("toolId", date)
       DO UPDATE SET upvotes = $3, "viewCount" = $4, stars = $5, rank = $6, "updatedAt" = NOW()`,
      tool.id,
      today,
      tool.upvotes || 0,
      tool.viewCount || 0,
      tool.stars || 0,
      i + 1,
    )
    recorded++
  }

  return { recorded, date: today }
}

export async function POST(request: NextRequest) {
  const token = process.env.MAINTENANCE_TOKEN
  const providedToken = request.headers.get('x-maintenance-token')

  if (!token || providedToken !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const limitPerSource = Math.min(Math.max(Number(body.limitPerSource) || 5, 1), 10)
  const news = body.news === false ? null : await importNews(limitPerSource)
  const trends = body.trends === false ? null : await recordTrendSnapshot()

  return NextResponse.json({
    ok: true,
    news,
    trends,
  })
}
