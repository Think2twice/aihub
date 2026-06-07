'use client'

import { useState } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import UserShareCard from '@/components/UserShareCard'

interface ShareLoadMoreProps {
  initialTab: string
  initialSkip: number
  totalCount: number
}

export default function ShareLoadMore({ initialTab, initialSkip, totalCount }: ShareLoadMoreProps) {
  const [loading, setLoading] = useState(false)
  const [shares, setShares] = useState<any[]>([])
  const [skip, setSkip] = useState(initialSkip)
  const loadedTotal = initialSkip + shares.length
  const [hasMore, setHasMore] = useState(loadedTotal < totalCount)

  // tab 值映射到 API type 参数（tech → tech_share, qa → qa_help）
  const apiType = initialTab === 'tech' ? 'tech_share' : initialTab === 'qa' ? 'qa_help' : initialTab

  const loadMore = async () => {
    setLoading(true)
    try {
      const nextPage = Math.floor(skip / 24) + 1
      const res = await fetch(`/api/shares?type=${apiType}&limit=24&page=${nextPage}`)
      const data = await res.json()
      const newShares = (data.shares || []).map((s: any) => ({
        ...s,
        viewCount: s.viewCount || 0,
        user: {
          ...s.user,
          role: s.user?.role || undefined
        }
      }))
      setShares(prev => [...prev, ...newShares])
      const newSkip = skip + newShares.length
      setSkip(newSkip)
      if (initialSkip + shares.length + newShares.length >= totalCount) {
        setHasMore(false)
      }
    } catch {
      // keep current state on error
    } finally {
      setLoading(false)
    }
  }

  if (totalCount <= initialSkip && shares.length === 0) return null

  const remaining = Math.max(0, totalCount - loadedTotal)

  return (
    <>
      {/* 新加载的分享卡片 - 放在网格中，使用 UserShareCard 保持样式统一 */}
      {shares.length > 0 && (
        <div className="space-y-6 mt-6">
          {shares.map((share: any) => (
            <UserShareCard key={share.id} share={share} />
          ))}
        </div>
      )}

      {/* 加载更多 / 已经到底了 */}
      <div className="text-center pt-4 pb-8">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-card border border-neon-cyan/30 hover:border-neon-cyan text-neon-cyan font-mono text-sm clip-chamfer-sm hover:bg-neon-cyan/5 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            {loading ? '加载中...' : `加载更多 (还有 ${remaining} 条)`}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-card border border-cyber-border clip-chamfer text-cyber-muted-foreground text-sm font-mono">
            <span>已经到底了</span>
            <span className="w-1 h-1 bg-cyber-muted-foreground rounded-full"></span>
            <span>共 {loadedTotal} 条</span>
          </div>
        )}
      </div>
    </>
  )
}
