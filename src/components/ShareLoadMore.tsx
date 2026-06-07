'use client'

import { useState } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface LoadMoreProps {
  initialTab: string
  initialSkip: number
}

export default function LoadMore({ initialTab, initialSkip }: LoadMoreProps) {
  const [loading, setLoading] = useState(false)
  const [shares, setShares] = useState<any[]>([])
  const [skip, setSkip] = useState(initialSkip)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/shares?type=${initialTab}&limit=24&page=${Math.floor(skip / 24) + 1}`)
      const data = await res.json()
      const newShares = data.shares || []
      if (newShares.length < 24) setHasMore(false)
      setShares(prev => [...prev, ...newShares])
      setSkip(prev => prev + newShares.length)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  if (!hasMore && shares.length === 0) return null

  return (
    <>
      {shares.map((share: any) => (
        <div key={share.id} className="bg-cyber-card border border-cyber-border clip-chamfer overflow-hidden hover:shadow-neon/50 transition-all duration-300 group h-[320px] flex flex-col">
          <div className={`h-1 flex-shrink-0 ${share.type === 'life' ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta' : share.type === 'tech_share' ? 'bg-gradient-to-r from-neon-green to-neon-cyan' : share.type === 'qa_help' ? 'bg-gradient-to-r from-neon-magenta to-red-500' : 'bg-gradient-to-r from-neon-green to-emerald-500'}`} />
          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-2 flex-shrink-0">
              {share.userAvatarUrl ? (
                <img src={share.userAvatarUrl} alt="" className="w-6 h-6 clip-chamfer-sm object-cover border border-cyber-border" />
              ) : (
                <div className="w-6 h-6 clip-chamfer-sm flex items-center justify-center text-[10px] font-bold text-cyber-background" style={{ background: `linear-gradient(135deg, ${stringToColor(share.userName || '?')}, #00d4ff)` }}>{share.userName?.charAt(0).toUpperCase() || '?'}</div>
              )}
              <span className="text-xs text-cyber-muted-foreground font-mono truncate">{share.userName}</span>
              <span className={`text-[9px] px-1.5 py-0.5 font-mono whitespace-nowrap flex-shrink-0 clip-chamfer-sm ${share.type === 'tool' ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : share.type === 'tech_share' ? 'text-neon-cyan bg-cyan-500/10 border border-cyan-500/20' : share.type === 'qa_help' ? 'text-neon-magenta bg-magenta-500/10 border border-magenta-500/20' : 'text-neon-green bg-green-500/10 border border-green-500/20'}`}>
                {share.type === 'tool' ? '工具圈' : share.type === 'tech_share' ? '技术' : share.type === 'qa_help' ? '问答' : '生活圈'}
              </span>
            </div>
            <p className="text-sm text-cyber-foreground font-mono leading-relaxed line-clamp-3 flex-1">{share.content}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyber-border/50 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-cyber-muted-foreground">
                <span className="flex items-center gap-1"><span className="text-neon-green">♥</span> {share.likes || 0}</span>
                <span className="flex items-center gap-1"><span className="text-neon-cyan">💬</span> {share.commentsCount || 0}</span>
              </div>
              <Link href={`/share/${share.id}`} className="text-[10px] text-neon-cyan hover:text-neon-green font-mono uppercase tracking-wider">查看详情 →</Link>
            </div>
          </div>
        </div>
      ))}
      {hasMore && (
        <div className="text-center pt-4 pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-card border border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan font-mono text-sm clip-chamfer-sm hover:bg-neon-cyan/5 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </>
  )
}

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, 60%, 50%)`
}
