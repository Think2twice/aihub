import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user/favorites?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: '需要userId' }, { status: 400 })

    const records = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT id, "toolData", "addedAt" FROM user_favorite_tools WHERE "userId" = $1 ORDER BY "addedAt" DESC`,
      parseInt(userId)
    )

    const favorites = records.map((r: any) => ({
      ...JSON.parse(r.toolData),
      addedAt: r.addedAt?.toISOString?.() || r.addedAt
    }))

    return NextResponse.json({ favorites })
  } catch (error: any) {
    console.error('[Favorites] GET错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/user/favorites - 添加/取消收藏
export async function POST(request: NextRequest) {
  try {
    const { userId, toolId, toolData } = await request.json()
    if (!userId || !toolId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const existing = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT id FROM user_favorite_tools WHERE "userId" = $1 AND "toolId" = $2 LIMIT 1`,
      userId, toolId
    )

    if (Array.isArray(existing) && existing.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM user_favorite_tools WHERE id = $1`, existing[0].id)
      return NextResponse.json({ favorited: false })
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO user_favorite_tools ("userId", "toolId", "toolData") VALUES ($1, $2, $3)`,
      userId, toolId, JSON.stringify(toolData)
    )
    return NextResponse.json({ favorited: true })
  } catch (error: any) {
    console.error('[Favorites] POST错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/user/favorites?userId=xxx&toolId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('userId') || '0')
    const toolId = parseInt(searchParams.get('toolId') || '0')
    if (!userId || !toolId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    await prisma.$executeRawUnsafe(
      `DELETE FROM user_favorite_tools WHERE "userId" = $1 AND "toolId" = $2`,
      userId, toolId
    )
    return NextResponse.json({ message: '已删除' })
  } catch (error: any) {
    console.error('[Favorites] DELETE错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
