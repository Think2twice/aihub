// 修复 SQLite sqlite_sequence 表与实际数据不同步的问题
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 修复 SQLite 序列 ===\n')

  try {
    // 查询 news 表现在的最大 id
    const maxIdResult = await prisma.$queryRaw<[{ max: number | null }]>`
      SELECT MAX(id) as max FROM news
    `
    const maxId = maxIdResult[0]?.max || 0
    console.log(`news 表当前最大 id: ${maxId}`)

    // 查询 sqlite_sequence 中 news 的序列值
    const seqResult = await prisma.$queryRaw<[{ name: string, seq: number }]>`
      SELECT name, seq FROM sqlite_sequence WHERE name = 'news'
    `

    if (seqResult.length > 0) {
      const seqValue = seqResult[0].seq
      console.log(`sqlite_sequence 中 news 的序列值: ${seqValue}`)

      if (seqValue <= maxId) {
        console.log(`\n⚠️  序列值(${seqValue}) <= 最大id(${maxId})，需要修复！`)
        console.log(`正在将序列值更新为 ${maxId + 1}...`)

        await prisma.$executeRaw`
          UPDATE sqlite_sequence SET seq = ${maxId + 1} WHERE name = 'news'
        `
        console.log('✓ 序列值已修复！')
      } else {
        console.log('\n✓ 序列值正常，无需修复')
      }
    } else {
      console.log('\n⚠️  sqlite_sequence 中没有 news 记录，正在插入...')
      await prisma.$executeRaw`
        INSERT INTO sqlite_sequence (name, seq) VALUES ('news', ${maxId + 1})
      `
      console.log('✓ 序列记录已插入！')
    }

    // 验证修复结果
    const newSeqResult = await prisma.$queryRaw<[{ seq: number }]>`
      SELECT seq FROM sqlite_sequence WHERE name = 'news'
    `
    console.log(`\n验证: sqlite_sequence 中 news 的新序列值: ${newSeqResult[0].seq}`)

  } catch (error) {
    console.error('错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
