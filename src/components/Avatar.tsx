'use client'

import Link from 'next/link'

// 根据字符串生成一致的颜色
function stringToColor(str: string): string {
  if (!str) return '#3B82F6'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#00ff88', '#00d4ff', '#ff00ff', '#ff3366', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ]
  return colors[Math.abs(hash) % colors.length]
}

// 调整颜色亮度
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

interface AvatarProps {
  /** 用户ID，用于生成跳转链接 */
  userId?: number
  /** 用户名，用于生成首字母和颜色 */
  username?: string
  /** 头像URL，如果存在则显示图片 */
  avatarUrl?: string | null
  /** 尺寸：xs=6, sm=8, md=10, lg=12, xl=16, xxl=20 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  /** 是否可点击跳转到用户主页 */
  linkable?: boolean
  /** 是否显示在线状态指示灯 */
  showOnline?: boolean
  /** 是否是 AI 助手 */
  isAI?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击回调（覆盖默认跳转行为） */
  onClick?: () => void
  /** 已解锁成就数量（>0 时在头像右下角显示成就徽章） */
  badgeCount?: number
}

const sizeMap = {
  xs: { wrapper: 'w-6 h-6', text: 'text-[10px]', online: 'w-2 h-2', onlineBorder: 'border', corner: 1 },
  sm: { wrapper: 'w-8 h-8', text: 'text-xs', online: 'w-2.5 h-2.5', onlineBorder: 'border-2', corner: 2 },
  md: { wrapper: 'w-10 h-10', text: 'text-sm', online: 'w-3 h-3', onlineBorder: 'border-2', corner: 3 },
  lg: { wrapper: 'w-12 h-12', text: 'text-lg', online: 'w-3.5 h-3.5', onlineBorder: 'border-2', corner: 4 },
  xl: { wrapper: 'w-16 h-16', text: 'text-xl', online: 'w-4 h-4', onlineBorder: 'border-2', corner: 5 },
  xxl: { wrapper: 'w-20 h-20', text: 'text-2xl', online: 'w-4 h-4', onlineBorder: 'border-2', corner: 8 },
}

export default function Avatar({
  userId,
  username,
  avatarUrl,
  size = 'md',
  linkable = false,
  showOnline = false,
  isAI = false,
  className = '',
  onClick,
  badgeCount,
}: AvatarProps) {
  // 获取首字母，过滤掉数字和非字母字符
  const getInitial = (str: string): string => {
    if (!str) return '?'
    const firstChar = str.charAt(0)
    // 如果是英文字母，返回大写
    if (/[a-z]/.test(firstChar)) return firstChar.toUpperCase()
    // 非英文字母（中文、数字、符号等）直接返回第一个字符
    return firstChar
  }
  const s = sizeMap[size]
  const color = stringToColor(username || '')
  const initial = getInitial(username || '')
  const cornerPx = s.corner

  // AI 助手使用 SVG 头像
  if (isAI) {
    const imgEl = (
      <img
        src="/avatars/ai-lobster.svg"
        alt="AI"
        className={`${s.wrapper} flex-shrink-0 object-cover ${className}`}
        style={{ clipPath: `polygon(0 0, calc(100% - ${cornerPx}px) 0, 100% ${cornerPx}px, 100% 100%, ${cornerPx}px 100%, 0 calc(100% - ${cornerPx}px))` }}
      />
    )
    if (linkable && userId) {
      return <Link href={`/u/${userId}`}>{imgEl}</Link>
    }
    return imgEl
  }

  // 头像内容
  const avatarContent = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={username || '用户头像'}
      className={`${s.wrapper} flex-shrink-0 object-cover ${className}`}
      style={{ clipPath: `polygon(0 0, calc(100% - ${cornerPx}px) 0, 100% ${cornerPx}px, 100% 100%, ${cornerPx}px 100%, 0 calc(100% - ${cornerPx}px))` }}
    />
  ) : (
    <div
      className={`${s.wrapper} flex items-center justify-center flex-shrink-0 text-[#0a0a0f] font-bold font-orbitron ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`,
        clipPath: `polygon(0 0, calc(100% - ${cornerPx}px) 0, 100% ${cornerPx}px, 100% 100%, ${cornerPx}px 100%, 0 calc(100% - ${cornerPx}px))`,
      }}
    >
      <span className={s.text}>{initial}</span>
    </div>
  )

  // 带在线状态指示灯和成就徽章
  const withIndicators = (
    <div className="relative inline-flex">
      {avatarContent}
      {showOnline && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${s.online} bg-[#00ff88] ${s.onlineBorder} border-[#12121a] z-10`}
          style={{ clipPath: `polygon(0 0, calc(100% - 1px) 0, 100% 1px, 100% 100%, 1px 100%, 0 calc(100% - 1px))` }}
        />
      )}
      {badgeCount !== undefined && badgeCount > 0 && size !== 'xs' && (
        <div
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center gap-0.5 px-1.5 bg-neon-green text-[#0a0a0f] text-[10px] font-bold font-mono z-20 shadow-[0_0_6px_rgba(0,255,136,0.5)]"
          style={{ clipPath: 'polygon(0 2px, 2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px))' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{badgeCount}</span>
        </div>
      )}
    </div>
  )

  // 可点击跳转
  if (onClick) {
    return (
      <div className="cursor-pointer" onClick={onClick}>
        {withIndicators}
      </div>
    )
  }

  if (linkable && userId) {
    return (
      <Link href={`/u/${userId}`} className="inline-block">
        {withIndicators}
      </Link>
    )
  }

  return withIndicators
}
