import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, any> = {}
  
  // 1. 测试环境变量
  results.env = {
    DATABASE_URL: (process.env.DATABASE_URL || '').substring(0, 80) + '...',
    DIRECT_URL: (process.env.DIRECT_URL || '').substring(0, 80) + '...',
  }

  // 2. 测试数据库连接
  try {
    const start = Date.now()
    const count = await prisma.category.count()
    results.db = { 
      connected: true, 
      categories: count,
      timeMs: Date.now() - start 
    }
  } catch (e: any) {
    results.db = { 
      connected: false, 
      error: e.message?.substring(0, 300),
      code: e.code 
    }
  }

  return NextResponse.json(results)
}
