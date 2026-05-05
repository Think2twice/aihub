// 修复 PostgreSQL sequence 与数据不同步的问题
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 修复 PostgreSQL 序列 ===\n')

  try {
    // 查询 news 表当前的最大 id
    const maxIdResult = await prisma.$queryRaw<[{ max: bigint | null }]>`
      SELECT MAX(id) as max FROM news
    `
    const maxId = Number(maxIdResult[0]?.max) || 0
    console.log(`news 表当前最大 id: ${maxId}`)

    // 查询 sequence 的当前值（PostgreSQL 中 SERIAL 会创建名为 {table}_{column}_seq 的序列）
    const seqResult = await prisma.$queryRaw<[{ last_value: bigint }]>`
      SELECT last_value FROM news_id_seq
    `
    const seqValue = Number(seqResult[0]?.last_value) || 0
    console.log(`news_id_seq 序列当前值: ${seqValue}`)

    if (seqValue <= maxId) {
      console.log(`\n⚠️  序列值(${seqValue}) <= 最大id(${maxId})，需要修复！`)
      console.log(`正在将序列值重置为 ${maxId + 1}...`)

      await prisma.$executeRawUnsafe(`ALTER SEQUENCE news_id_seq RESTART WITH ${maxId + 1}`)
      console.log('✓ 序列值已修复！')
    } else {
      console.log('\n✓ 序列值正常，无需修复')
    }

    // 验证修复结果
    const newSeqResult = await prisma.$queryRaw<[{ last_value: bigint }]>`
      SELECT last_value FROM news_id_seq
    `
    console.log(`\n验证: news_id_seq 的新序列值: ${newSeqResult[0].last_value}`)

  } catch (error) {
    console.error('错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
