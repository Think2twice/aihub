import { NextRequest, NextResponse } from 'next/server'
import { deleteNotification } from '@/lib/notification'

export async function POST(request: NextRequest) {
  try {
    const { notificationId, userId } = await request.json()
    if (!notificationId || !userId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }
    await deleteNotification(notificationId, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除通知失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
