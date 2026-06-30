import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 查询今天浏览最多的工具 (从 view_records)
    const rows = await prisma.$queryRawUnsafe<{ targetid: number; cnt: bigint }[]>(
      `SELECT vr."targetId" as targetid, COUNT(*) as cnt
       FROM view_records vr
       WHERE vr."targetType" = 'tool'
         AND vr."viewedAt" >= $1
       GROUP BY vr."targetId"
       ORDER BY cnt DESC
       LIMIT 5`,
      today
    )

    if (rows.length === 0) {
      return NextResponse.json({ tools: [] })
    }

    // 获取工具详情
    const ids = rows.map(r => Number(r.targetid))
    const tools = await prisma.$queryRawUnsafe<{ id: number; name: string; slug: string }[]>(
      `SELECT id, name, slug FROM tools WHERE id = ANY($1::int[])`,
      ids
    )

    // 组合数据
    const result = rows.map(r => {
      const tool = tools.find(t => t.id === Number(r.targetid))
      return {
        id: Number(r.targetid),
        name: tool?.name || '未知工具',
        slug: tool?.slug || '',
        views: Number(r.cnt),
      }
    })

    return NextResponse.json({ tools: result })
  } catch (e) {
    console.error('获取今日热榜失败:', e)
    return NextResponse.json({ tools: [] })
  }
}
