'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame } from 'lucide-react'

interface HotTool {
  id: number
  name: string
  slug: string
  views: number
}

export default function TodayHot() {
  const [tools, setTools] = useState<HotTool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/trending/daily')
      .then(r => r.json())
      .then(data => {
        if (data.tools?.length > 0) setTools(data.tools)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || tools.length === 0) return null

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-neon-yellow" />
        <span className="text-xs font-orbitron font-bold text-cyber-foreground uppercase tracking-wider">
          今日最热
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-neon-yellow/40 to-transparent" />
      </div>
      <div className="space-y-2">
        {tools.map((tool, i) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center justify-between group py-1.5 px-2 rounded hover:bg-cyber-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs font-mono font-bold w-5 flex-shrink-0 ${
                i === 0 ? 'text-neon-yellow' :
                i === 1 ? 'text-neon-yellow' :
                i === 2 ? 'text-neon-cyan' :
                'text-cyber-muted-foreground'
              }`}>
                #{i + 1}
              </span>
              <span className="text-sm text-cyber-foreground group-hover:text-neon-green transition-colors truncate font-mono">
                {tool.name}
              </span>
            </div>
            <span className="text-xs text-cyber-muted-foreground flex-shrink-0 ml-2 font-mono">
              <span className="text-neon-green">+</span>{tool.views}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
