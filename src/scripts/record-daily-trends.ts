// 每日趋势数据记录脚本
// 记录所有已通过工具的每日统计（upvotes, viewCount, stars）
// 运行方式: npm run record:trends
// 通过 GitHub Actions 每天自动调用

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function recordDailyTrends() {
  console.log('📊 开始记录每日趋势数据...')
  const startTime = Date.now()

  // 获取所有已通过且活跃的工具
  const tools = await prisma.$queryRawUnsafe<Array<any>>(`
    SELECT id, upvotes, "viewCount", stars FROM tools
    WHERE status = 'approved' AND "isActive" = true
  `)

  console.log(`  共 ${tools.length} 个工具`)

  const today = new Date().toISOString().split('T')[0]
  let success = 0
  let failed = 0

  for (const tool of tools) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO tool_trend_histories ("toolId", date, upvotes, "viewCount", stars, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ("toolId", date)
        DO UPDATE SET upvotes = $3, "viewCount" = $4, stars = $5, "updatedAt" = NOW()
      `, tool.id, today, tool.upvotes || 0, tool.viewCount || 0, tool.stars || 0)
      success++
    } catch (err) {
      console.error(`  ❌ 工具 #${tool.id} 记录失败:`, err)
      failed++
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`✅ 完成! 成功 ${success} / 失败 ${failed} (${elapsed}秒)`)
}

recordDailyTrends()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
