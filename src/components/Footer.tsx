import Link from 'next/link'
import { BrainCircuit, Github, Mail, Radio, ExternalLink } from 'lucide-react'
import FriendLinksBar from './FriendLinksBar'

// Telegram 图标组件
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

// B站图标组件
function BilibiliIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
    </svg>
  )
}

// Hugging Face 图标
function HuggingFaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.49 10.64c-.71-.23-1.1-.05-1.43.5a1.45 1.45 0 0 0-.2.76c0 .68.46 1.33 1.17 1.48a1.9 1.9 0 0 0 1.57-.43c.38-.33.6-.8.6-1.3 0-.65-.49-1.3-1.15-1.48l-.56-.53zm5.02 0c-.66.18-1.15.83-1.15 1.48 0 .5.22.97.6 1.3.43.38 1 .54 1.57.43.71-.15 1.17-.8 1.17-1.48 0-.27-.07-.53-.2-.76-.33-.55-.72-.73-1.43-.5l-.56-.47zM12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm6.17 16.76c-.09.08-.98.85-2.1 1.32l1.22 1.22c.13.14.13.35 0 .49l-.39.39c-.13.13-.35.13-.49 0l-1.5-1.5c-.78.2-1.63.3-2.58.3-2.88 0-5.08-.82-6.05-1.62l-1.5 1.5c-.14.13-.36.13-.49 0l-.39-.39c-.13-.14-.13-.35 0-.49l1.25-1.25c-1.05-.48-1.88-1.22-1.94-1.28-.13-.12-.13-.32 0-.44.12-.12.32-.12.44 0 .06.06.96.82 2.14 1.28l-.43-.43c-.12-.12-.12-.32 0-.44.12-.12.32-.12.44 0l.45.45c.87.3 1.97.54 3.23.64 1.23.1 2.52.07 3.71-.16l.52.52c.12.12.12.32 0 .44-.12.12-.32.12-.44 0l-.38-.38c-.06.02-.13.04-.19.06 0 0-.37.3-.97.53l1.48 1.48c.13.14.13.35 0 .49l-.39.39c-.13.13-.35.13-.49 0l-1.56-1.56c-.7.13-1.43.18-2.17.14l2.09 2.09c.14.14.14.36 0 .49l-.39.39c-.13.14-.35.14-.49 0l-2.73-2.73c-.17.02-.34.03-.5.03-2.35 0-4.3-.52-5.78-1.32l-.19-.1.39.39c.14.13.14.35 0 .48-.13.14-.35.14-.48 0l-.61-.61c.07.06.15.11.22.16 1.78 1.17 4.24 1.83 6.96 1.83 1.77 0 3.4-.28 4.76-.78l1.7 1.7c.13.13.13.34 0 .47-.13.14-.34.14-.47 0l-1.3-1.3c-.64.23-1.33.4-2.06.5l1.57 1.57c.13.13.13.34 0 .47-.13.14-.34.14-.47 0l-2.22-2.22c-.3.02-.6.03-.91.03-2.14 0-4.17-.38-5.83-1.06l-.1-.04.52.52c.14.14.14.36 0 .5-.14.13-.36.13-.5 0l-.86-.86c-.2-.2-.2-.52 0-.71l.43-.43c.2-.2.52-.2.71 0l.08.08c1.55.68 3.45 1.06 5.55 1.06.42 0 .84-.02 1.24-.06l-1.56-1.56c-.14-.14-.14-.36 0-.5.14-.13.36-.13.5 0l1.86 1.86c.67-.17 1.28-.38 1.84-.62l-1.36-1.36c-.14-.14-.14-.36 0-.5.14-.13.36-.13.5 0l1.66 1.66c.26-.15.5-.3.71-.46l-1.01-1.01c-.14-.14-.14-.36 0-.5.14-.13.36-.13.5 0l1.23 1.23c.18-.17.33-.34.44-.5l-.28-.28c-.14-.14-.14-.36 0-.5.14-.13.36-.13.5 0l.48.48c.22-.38.36-.66.36-.66.13-.28.06-.6-.18-.8z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-cyber-card border-t border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative">
                <BrainCircuit className="w-6 h-6 text-neon-green" />
                {/* Glitch effect layers */}
                <div className="absolute inset-0 w-6 h-6 text-neon-magenta opacity-0 group-hover:opacity-70 group-hover:translate-x-[1px] transition-all duration-100">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div className="absolute inset-0 w-6 h-6 text-neon-cyan opacity-0 group-hover:opacity-70 group-hover:-translate-x-[1px] transition-all duration-100">
                  <BrainCircuit className="w-6 h-6" />
                </div>
              </div>
              <span className="text-lg font-orbitron font-black text-cyber-foreground tracking-wider">
                <span className="text-neon-green">AI</span>
                <span className="relative">
                  HUB
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-neon-green via-neon-cyan to-neon-magenta" />
                </span>
              </span>
            </Link>
            <p className="text-sm text-cyber-muted-foreground font-mono">
              发现全球最新最热的AI工具、开源项目和AI资讯
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-cyber-foreground font-orbitron font-bold mb-4 uppercase tracking-wider text-sm">
              <span className="text-neon-cyan">{'>'}</span> 导航
            </h3>
            <ul className="space-y-2 text-sm font-mono">
              <li><Link href="/tools" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">AI工具</Link></li>
              <li><Link href="/news" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">AI资讯</Link></li>
              <li><Link href="/trending" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">趋势榜</Link></li>
              <li><Link href="/opensource" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">开源项目</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyber-foreground font-orbitron font-bold mb-4 uppercase tracking-wider text-sm">
              <span className="text-neon-magenta">{'>'}</span> 资源
            </h3>
            <ul className="space-y-2 text-sm font-mono">
              <li><Link href="/about" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">关于我们</Link></li>
              <li><Link href="/submit" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">提交工具</Link></li>
              <li><Link href="/api-docs" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">API文档</Link></li>
              <li><Link href="/rss" className="text-cyber-muted-foreground hover:text-neon-green transition-colors">RSS订阅</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyber-foreground font-orbitron font-bold mb-4 uppercase tracking-wider text-sm">
              <span className="text-neon-yellow">{'>'}</span> 关注我
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com/YD4223" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="GitHub"
                className="text-cyber-muted-foreground hover:text-neon-green transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://huggingface.co/SharwPeng" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Hugging Face"
                className="text-cyber-muted-foreground hover:text-neon-yellow transition-colors"
              >
                <HuggingFaceIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://b23.tv/smNNJTa" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Bilibili"
                className="text-cyber-muted-foreground hover:text-neon-green transition-colors"
              >
                <BilibiliIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/AT9966p" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Telegram"
                className="text-cyber-muted-foreground hover:text-neon-green transition-colors"
              >
                <TelegramIcon className="w-5 h-5" />
              </a>
              <a 
                href="mailto:508002830@qq.com" 
                title="商务合作"
                className="text-cyber-muted-foreground hover:text-neon-green transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <a 
              href="mailto:508002830@qq.com"
              className="text-xs text-cyber-muted-foreground mt-2 font-mono hover:text-neon-green transition-colors block"
            >
              商务合作
            </a>
          </div>
        </div>

        <FriendLinksBar />

        <div className="border-t border-cyber-border pt-6">
          {/* 免责声明 */}
          <p className="text-xs text-cyber-muted-foreground/60 text-center mb-4 px-4 font-mono">
            免责声明：本站所有工具和资源均来源于网络收集和网友分享，仅供学习交流使用。如有侵权或不妥之处，请联系我们及时处理。使用本站工具产生的任何风险和后果由用户自行承担，本站不承担任何责任。
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-cyber-muted-foreground font-mono">
            <Radio className="w-4 h-4 text-neon-green animate-pulse" />
            <span>© 2026 AI Hub. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
