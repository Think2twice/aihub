'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck, Share2, BookOpen, MessageCircle, Star,
  Flame, CalendarDays, TrendingUp, Trophy, Award, Compass, ThumbsUp,
  Lock, Sparkles, X
} from 'lucide-react'

interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  condition: string
  unlocked: boolean
  unlockedAt: string | null
}

const ICON_MAP: Record<string, any> = {
  CalendarCheck, Share2, BookOpen, MessageCircle, Star,
  Flame, CalendarDays, TrendingUp, Trophy, Award, Compass, ThumbsUp,
}

export default function AchievementWall({ userId }: { userId: number }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Achievement | null>(null)

  useEffect(() => {
    fetch(`/api/user/achievements?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setAchievements(data.achievements || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div>
      {/* 统计头 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-green" />
          <span className="text-sm font-mono text-cyber-foreground">
            成就墙
          </span>
        </div>
        <div className="text-xs font-mono text-cyber-muted-foreground">
          <span className="text-neon-green font-bold">{unlockedCount}</span>
          <span className="mx-1">/</span>
          <span>{achievements.length}</span>
        </div>
      </div>

      {/* 成就网格 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {achievements.map(ach => {
          const Icon = ICON_MAP[ach.icon]
          return (
            <button
              key={ach.id}
              onClick={() => setSelected(ach)}
              className={`group relative flex flex-col items-center gap-2 p-4 clip-chamfer-sm border transition-all duration-200 ${
                ach.unlocked
                  ? 'bg-neon-green/5 border-neon-green/40 hover:bg-neon-green/10 hover:border-neon-green hover:shadow-[0_0_10px_rgba(0,255,136,0.15)]'
                  : 'bg-cyber-background/50 border-cyber-border/40 hover:border-cyber-muted-foreground/30 cursor-pointer'
              }`}
            >
              {/* 已解锁发光效果 */}
              {ach.unlocked && (
                <div className="absolute inset-0 clip-chamfer-sm bg-gradient-to-br from-neon-green/5 via-transparent to-transparent pointer-events-none" />
              )}

              {/* 图标 */}
              <div className={`relative w-10 h-10 flex items-center justify-center transition-transform duration-200 ${
                ach.unlocked ? 'group-hover:scale-110' : ''
              }`}>
                {Icon ? (
                  <Icon className={`w-6 h-6 ${
                    ach.unlocked ? 'text-neon-green drop-shadow-[0_0_6px_rgba(0,255,136,0.5)]' : 'text-cyber-muted-foreground/40'
                  }`} />
                ) : (
                  <div className={`w-6 h-6 ${ach.unlocked ? 'text-neon-green' : 'text-cyber-muted-foreground/40'}`}>🏆</div>
                )}
                {!ach.unlocked && (
                  <Lock className="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-cyber-muted-foreground/30" />
                )}
              </div>

              {/* 名称 */}
              <span className={`text-[11px] font-mono text-center leading-tight ${
                ach.unlocked ? 'text-cyber-foreground font-medium' : 'text-cyber-muted-foreground/50'
              }`}>
                {ach.name}
              </span>

              {/* 已解锁标签 */}
              {ach.unlocked && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-green rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyber-background" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 详情弹窗 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-cyber-card border border-cyber-border clip-chamfer p-6 max-w-sm w-full mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center border border-cyber-border clip-chamfer-sm text-cyber-muted-foreground hover:text-cyber-foreground hover:border-neon-green transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              {/* 大图标 */}
              <div className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center clip-chamfer ${
                selected.unlocked ? 'bg-neon-green/10 border border-neon-green/40' : 'bg-cyber-background border border-cyber-border'
              }`}>
                {(() => {
                  const Icon = ICON_MAP[selected.icon]
                  return Icon ? (
                    <Icon className={`w-8 h-8 ${selected.unlocked ? 'text-neon-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'text-cyber-muted-foreground/40'}`} />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )
                })()}
              </div>

              <h3 className={`text-lg font-orbitron font-bold mb-1 ${selected.unlocked ? 'text-neon-green' : 'text-cyber-muted-foreground'}`}>
                {selected.name}
              </h3>

              <p className="text-sm text-cyber-muted-foreground font-mono mb-3">
                {selected.description}
              </p>

              <div className={`px-3 py-2 clip-chamfer-sm text-xs font-mono ${
                selected.unlocked
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  : 'bg-cyber-background text-cyber-muted-foreground/60 border border-cyber-border'
              }`}>
                {selected.unlocked ? (
                  <>✅ 已解锁 · {new Date(selected.unlockedAt!).toLocaleDateString('zh-CN')}</>
                ) : (
                  <>🔒 {selected.condition}</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
