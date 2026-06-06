import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import { uploadImage, parseBase64Image, isR2Configured } from '@/lib/r2'

// GET /api/admin/migrate-images  将已存的 base64 图片迁移到 R2
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (auth instanceof NextResponse) return auth

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 未配置' }, { status: 400 })
  }

  const results: string[] = []
  let migrated = 0
  let skipped = 0

  try {
    // 查询有 base64 图片的分享
    const shares = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT id, images FROM shares 
      WHERE images IS NOT NULL AND images LIKE '["%data:image/%'
    `)

    for (const share of shares) {
      const images: string[] = JSON.parse(share.images)
      if (!Array.isArray(images) || images.length === 0) { skipped++; continue }

      const uploadedUrls: string[] = []
      let hasChange = false

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          const parsed = parseBase64Image(img)
          if (parsed) {
            const key = `shares/migrate/${share.id}-${i}.${parsed.mimeType.split('/')[1]}`
            const url = await uploadImage(key, parsed.buffer, parsed.mimeType)
            uploadedUrls.push(url)
            hasChange = true
          } else {
            uploadedUrls.push(img)
          }
        } else {
          uploadedUrls.push(img)
        }
      }

      if (hasChange) {
        await prisma.$executeRawUnsafe(
          `UPDATE shares SET images = $1 WHERE id = $2`,
          JSON.stringify(uploadedUrls),
          share.id
        )
        results.push(`✅ #${share.id}: ${images.length} 张图 → R2`)
        migrated++
      } else {
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      total: shares.length,
      migrated,
      skipped,
      details: results
    })
  } catch (error: any) {
    console.error('迁移失败:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
