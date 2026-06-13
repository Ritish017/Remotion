'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AgentStep } from '@/lib/types'

interface AgentThinkingIndicatorProps {
  agentName: string
  steps: AgentStep[]
  isRunning: boolean
}

export function AgentThinkingIndicator({ agentName, steps, isRunning }: AgentThinkingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isRunning) return
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 100)
    return () => clearInterval(timer)
  }, [isRunning])

  return (
    <Card className="bg-bg-surface2 border-border-DEFAULT">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span>{agentName}</span>
          <span className="text-muted-foreground">—</span>
          <span className={isRunning ? 'text-accent-ai' : 'text-muted-foreground'}>
            {isRunning ? 'Working' : 'Complete'}
          </span>
          {isRunning && (
            <span className="font-mono text-xs text-muted-foreground ml-auto">{elapsed}s</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            {step.status === 'done' ? (
              <Check size={14} className="text-accent-ai shrink-0" />
            ) : step.status === 'running' ? (
              <Loader2 size={14} className="text-accent-brand animate-spin shrink-0" />
            ) : step.status === 'error' ? (
              <Circle size={14} className="text-red-500 shrink-0" />
            ) : (
              <Circle size={14} className="text-muted-foreground/30 shrink-0" />
            )}
            <span className={step.status === 'done' ? 'text-foreground' : step.status === 'running' ? 'text-foreground' : 'text-muted-foreground/50'}>
              {step.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
