import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ALL_ACHIEVEMENTS } from '@/lib/achievements'
import { checkAndUnlock } from '@/lib/check-achievements'

// GET /api/user/achievements?userId=X
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: '缺少 userId' }, { status: 400 })
  }

  try {
    const uid = parseInt(userId)

    // 先检查新成就
    await checkAndUnlock(uid)

    // 获取已解锁成就
    const unlocked = await prisma.$queryRawUnsafe<Array<any>>(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at ASC`,
      uid
    )

    const unlockedMap = new Map<string, string>()
    for (const row of unlocked) {
      unlockedMap.set(row.achievement_id, row.unlocked_at)
    }

    // 组装完整成就列表
    const achievements = ALL_ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }))

    return NextResponse.json({
      achievements,
      total: achievements.length,
      unlockedCount: unlocked.length,
    })
  } catch (error) {
    console.error('[Achievements] 获取成就失败:', error)
    return NextResponse.json({ error: '获取成就失败' }, { status: 500 })
  }
}
