import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ACTIVE_WINDOW_MINUTES = 5   // 5分钟内视为在线
const CLEANUP_INTERVAL = 60       // 每60次ping清理一次过期的session

// 获取在线人数
export async function GET() {
  try {
    const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000)
    
    const count = await prisma.onlineVisitor.count({
      where: { lastSeen: { gte: cutoff } }
    })
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('获取在线人数失败:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}

// 记录心跳并返回在线人数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = body.sessionId as string
    
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8) {
      return NextResponse.json({ error: '无效的 sessionId' }, { status: 400 })
    }
    
    const now = new Date()
    const cutoff = new Date(now.getTime() - ACTIVE_WINDOW_MINUTES * 60 * 1000)
    
    // 先删除旧记录，再插入新记录（模拟 upsert，因为表没建唯一键）
    await prisma.onlineVisitor.deleteMany({ where: { sessionId } })
    await prisma.onlineVisitor.create({ data: { sessionId, lastSeen: now } })
    
    // 统计在线人数
    const count = await prisma.onlineVisitor.count({
      where: { lastSeen: { gte: cutoff } }
    })
    
    // 定期清理30分钟前未更新的陈旧记录（约 1/60 概率触发）
    if (Math.random() < 1 / CLEANUP_INTERVAL) {
      const staleCutoff = new Date(now.getTime() - 30 * 60 * 1000)
      await prisma.onlineVisitor.deleteMany({
        where: { lastSeen: { lt: staleCutoff } }
      }).catch(() => {})
    }
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('心跳记录失败:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
