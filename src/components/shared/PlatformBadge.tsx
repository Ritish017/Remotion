'use client'

import { Globe, Play, AtSign, Briefcase } from 'lucide-react'
import { PLATFORM_COLORS } from '@/lib/constants'

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  instagram: AtSign,
  youtube: Play,
  x: Globe,
  linkedin: Briefcase,
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  x: 'X',
  linkedin: 'LinkedIn',
}

export function PlatformBadge({ platform, showLabel = true, size = 14 }: { platform: string; showLabel?: boolean; size?: number }) {
  const Icon = PLATFORM_ICONS[platform]
  const color = PLATFORM_COLORS[platform] || '#71717a'
  const label = PLATFORM_LABELS[platform] || platform

  return (
    <span className="inline-flex items-center gap-1.5" style={{ color }}>
      {Icon && <Icon size={size} />}
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </span>
  )
}
