import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canLike, incrementLikeCount } from '@/lib/daily-limit'
import { createNotification } from '@/lib/notification'
import { addExp } from '@/lib/add-exp'
import { EXP_RULES } from '@/lib/level'
import { checkAndUnlock } from '@/lib/check-achievements'

// GET /api/user/likes?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: '需要userId' }, { status: 400 })

    const records = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT id, "toolData", "likedAt" FROM user_like_tools WHERE "userId" = $1 ORDER BY "likedAt" DESC`,
      parseInt(userId)
    )

    const likes = records.map((r: any) => ({
      ...JSON.parse(r.toolData),
      likedAt: r.likedAt?.toISOString?.() || r.likedAt
    }))

    return NextResponse.json({ likes })
  } catch (error: any) {
    console.error('[Likes] GET错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/user/likes - 添加/取消点赞
export async function POST(request: NextRequest) {
  try {
    const { userId, toolId, toolData, shareId } = await request.json()
    if (!userId || !toolId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    // 只限制"点赞"操作，取消点赞不限制
    const existing = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT id FROM user_like_tools WHERE "userId" = $1 AND "toolId" = $2 LIMIT 1`,
      userId, toolId
    )

    // 如果已经点过赞（要取消），跳过日限检查
    if (!(Array.isArray(existing) && existing.length > 0)) {
      const { allowed } = await canLike(userId)
      if (!allowed) {
        return NextResponse.json({ error: '今日点赞次数已达上限（每天5次），请明天再试' }, { status: 429 })
      }
    }

    if (Array.isArray(existing) && existing.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM user_like_tools WHERE id = $1`, existing[0].id)
      // 同步更新 tools 表和 shares 表的点赞数
      await prisma.$executeRawUnsafe(
        `UPDATE tools SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1`,
        toolId
      )
      let newLikes = 0
      if (shareId) {
        const result = await prisma.$queryRawUnsafe<Array<any>>(
          `UPDATE shares SET likes = GREATEST(0, likes - 1) WHERE id = $1 RETURNING likes`,
          shareId
        )
        newLikes = Number(result[0]?.likes || 0)
      }
      return NextResponse.json({ liked: false, likes: newLikes })
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO user_like_tools ("userId", "toolId", "toolData") VALUES ($1, $2, $3)`,
      userId, toolId, JSON.stringify(toolData)
    )
    // 记录点赞次数
    await incrementLikeCount(userId)
    // 同步更新 tools 表和 shares 表的点赞数
    await prisma.$executeRawUnsafe(
      `UPDATE tools SET upvotes = upvotes + 1 WHERE id = $1`,
      toolId
    )
    let newLikes = 0
    if (shareId) {
      const result = await prisma.$queryRawUnsafe<Array<any>>(
        `UPDATE shares SET likes = likes + 1 WHERE id = $1 RETURNING likes`,
        shareId
      )
      newLikes = Number(result[0]?.likes || 0)

      // 通知分享作者有人点赞（异步）
      try {
        const share = await prisma.$queryRawUnsafe<Array<any>>(
          `SELECT "userId" FROM shares WHERE id = $1`,
          shareId
        )
        const ownerId = (share as any[])[0]?.userId
        if (ownerId && Number(ownerId) !== Number(userId)) {
          // 点赞通知
          createNotification({
            userId: ownerId,
            type: 'like',
            title: '有人赞了你的分享',
            content: '',
            link: `/share/${shareId}`,
            relatedUserId: Number(userId),
          }).catch(() => {})
          // 点赞加经验（给被赞的人）
          addExp(Number(ownerId), EXP_RULES.GET_LIKE_ON_SHARE).catch(() => {})
          // 成就检查
          checkAndUnlock(Number(ownerId)).catch(() => {})
        }
      } catch (e) {
        console.error('点赞通知失败:', e)
      }
    }
    return NextResponse.json({ liked: true, likes: newLikes })
  } catch (error: any) {
    console.error('[Likes] POST错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/user/likes?userId=xxx&toolId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get('userId') || '0')
    const toolId = parseInt(searchParams.get('toolId') || '0')
    if (!userId || !toolId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    await prisma.$executeRawUnsafe(
      `DELETE FROM user_like_tools WHERE "userId" = $1 AND "toolId" = $2`,
      userId, toolId
    )
    // 同步更新 tools 表的点赞数
    await prisma.$executeRawUnsafe(
      `UPDATE tools SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1`,
      toolId
    )
    return NextResponse.json({ message: '已删除' })
  } catch (error: any) {
    console.error('[Likes] DELETE错误:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
