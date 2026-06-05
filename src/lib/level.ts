// 等级配置
const LEVEL_CONFIG = [
  { level: 1, expRequired: 0, title: '新手上路' },
  { level: 2, expRequired: 100, title: '初级玩家' },
  { level: 3, expRequired: 300, title: '活跃用户' },
  { level: 4, expRequired: 600, title: '社区之星' },
  { level: 5, expRequired: 1000, title: '资深达人' },
  { level: 6, expRequired: 1500, title: 'AI先锋' },
  { level: 7, expRequired: 2100, title: '科技极客' },
  { level: 8, expRequired: 2800, title: '社区精英' },
  { level: 9, expRequired: 3600, title: '大师级' },
  { level: 10, expRequired: 5000, title: '传奇' },
]

export function getLevelConfig(level: number) {
  return LEVEL_CONFIG.find(l => l.level === level) || LEVEL_CONFIG[0]
}

export function getLevelByExp(exp: number) {
  let level = 1
  for (const cfg of LEVEL_CONFIG) {
    if (exp >= cfg.expRequired) level = cfg.level
    else break
  }
  return level
}

export function getExpProgress(exp: number) {
  const currentLevel = getLevelByExp(exp)
  const currentCfg = LEVEL_CONFIG.find(l => l.level === currentLevel)!
  const nextCfg = LEVEL_CONFIG.find(l => l.level === currentLevel + 1)
  if (!nextCfg) return { current: exp, required: currentCfg.expRequired, progress: 1, maxed: true }
  const currentExp = exp - currentCfg.expRequired
  const required = nextCfg.expRequired - currentCfg.expRequired
  return { current: exp, required: nextCfg.expRequired, progress: Math.min(1, currentExp / required), maxed: false }
}

export const EXP_RULES = {
  SIGN_IN: 10,
  STREAK_BONUS: 3, // per consecutive day
  CREATE_SHARE: 20,
  CREATE_COMMENT: 10,
  GET_LIKE_ON_SHARE: 5,
  GET_LIKE_ON_COMMENT: 3,
}
