'use client'

import { cn } from '@/lib/utils'

interface HashtagPillProps {
  tag: string
  selected?: boolean
  trending?: boolean
  reach?: string
  onClick?: () => void
}

export function HashtagPill({ tag, selected = false, trending = false, reach, onClick }: HashtagPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        'border cursor-pointer',
        selected
          ? 'bg-accent-brand/15 border-accent-brand/30 text-accent-brand'
          : trending
            ? 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20'
            : 'bg-bg-surface2 border-border-DEFAULT text-muted-foreground hover:bg-bg-surface3 hover:text-foreground'
      )}
    >
      <span>{tag.startsWith('#') ? tag : `#${tag}`}</span>
      {reach && <span className="font-mono text-[10px] opacity-60">{reach}</span>}
      {trending && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />}
    </button>
  )
}
