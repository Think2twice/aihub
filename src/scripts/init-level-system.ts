import { prisma } from '@/lib/prisma'

async function main() {
  // 添加 exp/level 字段
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS exp INT NOT NULL DEFAULT 0`);
    console.log('✅ users.exp 字段已添加');
  } catch (e: any) { if (!e.message?.includes('already exists')) console.error('exp:', e.message); }
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1`);
    console.log('✅ users.level 字段已添加');
  } catch (e: any) { if (!e.message?.includes('already exists')) console.error('level:', e.message); }

  // 创建签到表
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
    `);
    console.log('✅ user_sign_ins 表已创建');
  } catch (e: any) { console.error('sign_ins:', e.message); }

  // 创建索引
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_user_sign_ins_user_id ON user_sign_ins("userId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_user_sign_ins_date ON user_sign_ins("signInDate")`);
    console.log('✅ 索引已创建');
  } catch (e: any) { console.error('index:', e.message); }

  await prisma.$disconnect()
}

main().catch(console.error)
