import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '通知 | AI Hub',
  description: '查看你的点赞、评论、关注等消息通知，及时了解社区互动动态。',
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
