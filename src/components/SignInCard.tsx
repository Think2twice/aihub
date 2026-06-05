'use client'

import { useState, useEffect } from 'react'
import { Calendar, Check, Loader2, Sparkles, Flame, Star } from 'lucide-react'
import { useExpToast } from '@/components/ExpToast'

export default function SignInCard() {
  const [user, setUser] = useState<any>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [exp, setExp] = useState(0)
  const [signingIn, setSigningIn] = useState(false)
  const { showExpToast } = useExpToast()

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) {
      const parsed = JSON.parse(u)
      setUser(parsed)
      fetch(`/api/user/sign-in?userId=${parsed.id}`).then(r => r.json()).then(d => {
        setSignedIn(d.signedIn)
        setStreak(d.streak || 0)
        setLevel(d.level || 1)
        setExp(d.exp || 0)
      }).catch(() => {})
    }
  }, [])

  const handleSignIn = async () => {
    if (!user || signingIn) return
    setSigningIn(true)
    try {
      const res = await fetch('/api/user/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        setSignedIn(true)
        setStreak(data.streak)
        setLevel(data.level)
        setExp(data.totalExp)
        showExpToast(data.expGain, `+${data.expGain} EXP 签到成功`)
      }
    } catch (e) {}
    setSigningIn(false)
  }

  if (!user) return null

  return (
    <div className="bg-cyber-card border border-cyber-border clip-chamfer p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent" />
      
      {/* 等级和进度 */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-orbitron font-bold text-cyber-foreground uppercase tracking-wider text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-neon-green" />
            我的等级
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neon-green/20 text-neon-green border border-neon-green/30 clip-chamfer-sm">
              Lv.{level}
            </span>
            <span className="text-xs text-cyber-muted-foreground font-mono">{exp} EXP</span>
          </div>
        </div>
        {/* 进度条 */}
        <div className="w-full h-1.5 bg-cyber-background rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full" style={{ width: `${level >= 10 ? 100 : ((exp - levelThresholds[level]) / (levelThresholds[level + 1] - levelThresholds[level])) * 100}%` }} />
        </div>
        {level < 10 && (
          <p className="text-[10px] text-cyber-muted-foreground font-mono mt-1">
            距 Lv.{level + 1} 还需 {levelThresholds[level + 1] - exp} EXP
          </p>
        )}
      </div>

      {/* 签到按钮 */}
      <div className="relative mb-4">
        <button
          onClick={handleSignIn}
          disabled={signedIn || signingIn}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono font-bold transition-all duration-200 ${
            signedIn
              ? 'bg-neon-green/10 text-neon-green/60 border border-neon-green/30 cursor-default'
              : 'bg-neon-green text-cyber-background hover:bg-neon-green/90 active:scale-[0.98] shadow-[0_0_15px_rgba(0,255,136,0.3)]'
          }`}
          style={{ clipPath: 'polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px))' }}
        >
          {signingIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : signedIn ? (
            <>
              <Check className="w-4 h-4" />
              今日已签到
              {streak > 0 && <span className="text-neon-cyan">🔥 {streak}天</span>}
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              签到领经验
            </>
          )}
        </button>
      </div>

      {/* 规则说明 */}
      <div className="relative">
        <h4 className="text-xs font-mono font-bold text-cyber-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-neon-cyan" />
          经验获取规则
        </h4>
        <div className="space-y-1.5 text-[11px] font-mono text-cyber-muted-foreground">
          <div className="flex justify-between">
            <span>📅 每日签到</span>
            <span className="text-neon-green font-bold">+10 EXP</span>
          </div>
          <div className="flex justify-between">
            <span>🔥 连续签到加成</span>
            <span className="text-neon-cyan font-bold">+3/天 EXP</span>
          </div>
          <div className="flex justify-between">
            <span>📝 分享通过审核</span>
            <span className="text-neon-green font-bold">+20 EXP</span>
          </div>
          <div className="flex justify-between">
            <span>💬 发表评论</span>
            <span className="text-neon-green font-bold">+10 EXP</span>
          </div>
          <div className="flex justify-between">
            <span>❤️ 分享获赞</span>
            <span className="text-neon-green font-bold">+5 EXP</span>
          </div>
          <div className="flex justify-between">
            <span>💬 评论获赞</span>
            <span className="text-neon-green font-bold">+3 EXP</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-cyber-border/50">
          <p className="text-[10px] text-cyber-muted-foreground font-mono">
            升至 Lv.10 共需 5000 EXP · 快去社区互动吧
          </p>
        </div>
      </div>
    </div>
  )
}

const levelThresholds: Record<number, number> = { 1:0, 2:100, 3:300, 4:600, 5:1000, 6:1500, 7:2100, 8:2800, 9:3600, 10:5000 }
