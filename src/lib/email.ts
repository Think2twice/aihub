import nodemailer from 'nodemailer'
import { prisma } from './prisma'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  fromName: string
}

function envFlag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function getEmailConfig(): EmailConfig | null {
  const hasResendKey = Boolean(process.env.RESEND_API_KEY)
  const legacyQQUser = process.env.QQ_EMAIL || ''

  const host = process.env.SMTP_HOST || (hasResendKey ? 'smtp.resend.com' : legacyQQUser ? 'smtp.qq.com' : '')
  const port = Number(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER || (hasResendKey ? 'resend' : legacyQQUser)
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.RESEND_API_KEY || process.env.QQ_EMAIL_AUTH_CODE || ''
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || (hasResendKey ? 'noreply@mail.formyweblym.top' : legacyQQUser)
  const fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || 'AIHub'

  if (!host || !port || !user || !pass || !from) return null

  return {
    host,
    port,
    secure: envFlag(process.env.SMTP_SECURE, port === 465),
    user,
    pass,
    from,
    fromName,
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 发送邮件
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const emailConfig = getEmailConfig()
    if (!emailConfig) {
      return { success: false, error: '邮件服务未配置：请配置 SMTP_HOST、SMTP_USER、SMTP_PASS 和 EMAIL_FROM' }
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    })

    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('[Email] 发送成功:', info.messageId)
    return { success: true }
  } catch (error: any) {
    console.error('[Email] 发送失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 发送邮箱验证码
export async function sendVerificationCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: '【AIHub】验证码',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: #0a0a0f; margin: 0;">AIHub</h2>
        </div>
        <div style="background: #12121a; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #2a2a3a;">
          <p style="color: #aaa; font-size: 14px; margin: 0 0 16px;">你正在注册/绑定邮箱，验证码为：</p>
          <div style="background: #1a1a2e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="color: #00ff88; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #666; font-size: 12px; margin: 16px 0 0;">有效时间 5 分钟，请勿泄露给他人</p>
        </div>
      </div>
    `,
  })
}

// 生成6位验证码
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 保存验证码到数据库（5分钟有效）
export async function saveVerificationCode(email: string, code: string): Promise<void> {
  // 清除该邮箱之前的失效验证码
  await prisma.$executeRawUnsafe(
    `DELETE FROM verification_codes WHERE email = $1 AND "expiresAt" < NOW()`,
    email.toLowerCase()
  )
  // 插入新验证码
  await prisma.$executeRawUnsafe(
    `INSERT INTO verification_codes (email, code, "expiresAt", used, "createdAt") VALUES ($1, $2, NOW() + INTERVAL '5 minutes', false, NOW())`,
    email.toLowerCase(), code
  )
}

// 验证验证码（查数据库）
export async function verifyCode(email: string, inputCode: string): Promise<boolean> {
  const result = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
    `SELECT id FROM verification_codes 
     WHERE email = $1 AND code = $2 AND used = false AND "expiresAt" > NOW()
     ORDER BY "createdAt" DESC LIMIT 1`,
    email.toLowerCase(), inputCode
  )
  if (!Array.isArray(result) || result.length === 0) return false
  // 标记为已使用（一次性验证码）
  await prisma.$executeRawUnsafe(
    `UPDATE verification_codes SET used = true WHERE id = $1`,
    result[0].id
  )
  return true
}
