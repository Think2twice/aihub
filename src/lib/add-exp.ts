import { prisma } from './prisma'
import { getLevelByExp } from './level'

/**
 * 给用户增加经验值，并自动更新等级
 */
export async function addExp(userId: number, amount: number) {
  try {
    const result = await prisma.$queryRawUnsafe<Array<any>>(
      `UPDATE users SET exp = exp + $1 WHERE id = $2 RETURNING exp`,
      amount, userId
    )
    const totalExp = Number(result[0]?.exp || 0)
    const newLevel = getLevelByExp(totalExp)

    await prisma.$executeRawUnsafe(
      `UPDATE users SET level = $1 WHERE id = $2 AND level < $1`,
      newLevel, userId
    )

    return { totalExp, newLevel, gained: amount }
  } catch (error) {
    console.error('[addExp] 失败:', error)
    return { totalExp: 0, newLevel: 1, gained: 0 }
  }
}
