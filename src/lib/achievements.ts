export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  condition: string
}

// 12 枚成就徽章定义
export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sign_in',
    name: '初来乍到',
    icon: 'CalendarCheck',
    description: '首次签到打卡',
    condition: '完成第一次签到',
  },
  {
    id: 'first_share',
    name: '分享新手',
    icon: 'Share2',
    description: '首次分享通过审核',
    condition: '第一次分享通过管理员审核',
  },
  {
    id: 'share_master',
    name: '分享达人',
    icon: 'BookOpen',
    description: '累计 20 个分享通过审核',
    condition: '分享通过审核数达到 20 个',
  },
  {
    id: 'comment_master',
    name: '评论大师',
    icon: 'MessageCircle',
    description: '累计 50 条评论',
    condition: '评论数达到 50 条',
  },
  {
    id: 'popular_star',
    name: '人气之星',
    icon: 'Star',
    description: '单条分享获赞 ≥20',
    condition: '某条分享获得 20 个以上点赞',
  },
  {
    id: 'community_star',
    name: '社区红人',
    icon: 'Flame',
    description: '获赞总数 ≥100',
    condition: '所有分享获赞总数达到 100',
  },
  {
    id: 'sign_in_king',
    name: '签到王者',
    icon: 'CalendarDays',
    description: '连续签到 30 天',
    condition: '连续签到天数达到 30 天',
  },
  {
    id: 'level_5',
    name: '升级达人',
    icon: 'TrendingUp',
    description: '达到 Lv.5',
    condition: '用户等级达到 5 级',
  },
  {
    id: 'level_10',
    name: '社区领袖',
    icon: 'Trophy',
    description: '达到 Lv.10',
    condition: '用户等级达到 10 级（满级）',
  },
  {
    id: 'exp_100',
    name: '第一个 100',
    icon: 'Award',
    description: 'EXP 达到 100',
    condition: '累计经验值达到 100',
  },
  {
    id: 'life_explorer',
    name: '探索者',
    icon: 'Compass',
    description: '发布生活圈动态',
    condition: '在生活圈发布过动态',
  },
  {
    id: 'like_giver',
    name: '社交达人',
    icon: 'ThumbsUp',
    description: '给 5 个不同人的帖子点赞',
    condition: '给至少 5 位不同用户点过赞',
  },
]

export function getAchievement(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.id === id)
}

export function getAllAchievementIds(): string[] {
  return ALL_ACHIEVEMENTS.map(a => a.id)
}
