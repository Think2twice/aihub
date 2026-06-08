'use client'

import { Github } from 'lucide-react'

export default function ContactButton() {
  return (
    <a
      href="https://github.com/YD4223/aihub/issues/new"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-6 py-2.5 border border-cyber-border rounded-lg text-cyber-muted-foreground font-orbitron text-sm uppercase tracking-wider hover:border-neon-green hover:text-neon-green transition-colors"
    >
      <Github className="w-4 h-4" />
      反馈建议
    </a>
  )
}
