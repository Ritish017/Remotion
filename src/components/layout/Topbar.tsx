'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function Topbar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-[52px] bg-bg-surface border-b border-border-DEFAULT flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold tracking-tight">
          CATALYST<span className="text-accent-brand">.</span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] py-0 h-5 border-border-strong text-muted-foreground bg-transparent hover:bg-transparent">
          v4.0
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-ai opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-ai"></span>
          </span>
          <span className="font-mono text-xs text-muted-foreground tracking-wide">
            server:8000 · online
          </span>
        </div>
        <div className="font-mono text-sm tracking-wider w-[76px] text-right">
          {time}
        </div>
      </div>
    </header>
  )
}
