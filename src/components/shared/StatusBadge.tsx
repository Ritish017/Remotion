'use client'

import { Badge } from '@/components/ui/badge'
import { EPISODE_STATUS_CONFIG } from '@/lib/constants'

export function StatusBadge({ status }: { status: string }) {
  const config = EPISODE_STATUS_CONFIG[status] || { label: status, color: '#71717a' }
  return (
    <Badge
      variant="outline"
      className="font-mono text-[10px] py-0 h-5 border-current/20 bg-transparent hover:bg-transparent"
      style={{ color: config.color }}
    >
      {config.label}
    </Badge>
  )
}
