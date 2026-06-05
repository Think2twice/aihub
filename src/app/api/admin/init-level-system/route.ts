/**
 * 一次性初始化：添加等级系统所需数据库字段
 * 管理员登录后访问 /api/admin/init-level-system
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (auth instanceof NextResponse) return auth
  if (!auth.isAdmin) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const log: string[] = []

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS exp INT NOT NULL DEFAULT 0`)
    log.push('✅ exp 字段添加')
  } catch (e: any) { log.push(`⚠️ exp: ${e.message}`) }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1`)
    log.push('✅ level 字段添加')
  } catch (e: any) { log.push(`⚠️ level: ${e.message}`) }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS user_sign_ins (
        id SERIAL PRIMARY KEY,
        "userId" INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "signInDate" DATE NOT NULL DEFAULT CURRENT_DATE,
        streak INT NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("userId", "signInDate")
      )
    `)
    log.push('✅ user_sign_ins 表创建')
  } catch (e: any) { log.push(`⚠️ sign_ins: ${e.message}`) }

  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_user_sign_ins_user_id ON user_sign_ins("userId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_user_sign_ins_date ON user_sign_ins("signInDate")`)
    log.push('✅ 索引创建')
  } catch (e: any) { log.push(`⚠️ index: ${e.message}`) }

  return NextResponse.json({ success: true, log })
}
