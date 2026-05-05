// 清理30天前的旧资讯
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const days = parseInt(process.argv[2] || '30')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  console.log(`🗑️ 清理 ${days} 天前的旧资讯（${cutoff.toISOString().split('T')[0]} 之前）...`)

  const result = await prisma.news.deleteMany({
    where: {
      publishedAt: { lt: cutoff }
    }
  })

  console.log(`✅ 已删除 ${result.count} 条旧资讯`)
  await prisma.$disconnect()
}

main().catch(e => {
  console.error('清理失败:', e)
  process.exit(1)
})
