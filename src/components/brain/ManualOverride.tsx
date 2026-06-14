'use client'

import { useState } from 'react'
import { Play, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ManualOverrideProps {
  campaignId: string
  accentColor?: string
  onComplete?: (result: any) => void
}

export function ManualOverride({ campaignId, accentColor = '#6c47ff', onComplete }: ManualOverrideProps) {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  async function triggerBrain() {
    setRunning(true)
    setError(null)

    try {
      const res = await fetch('/api/brain/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Brain run failed')
        return
      }

      setLastResult(data)
      onComplete?.(data)
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="bg-bg-surface border-border-DEFAULT">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-sm font-semibold">Manual Brain Trigger</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Force the brain to run now and create today's episodes. Normally runs automatically at 6 AM.
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button
          onClick={triggerBrain}
          disabled={running}
          className="w-full"
          style={{ background: accentColor }}
        >
          {running ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" />
              Brain is thinking…
            </>
          ) : (
            <>
              <Play size={14} className="mr-2" />
              Run Brain Now
            </>
          )}
        </Button>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {lastResult && !error && (
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <p className="text-xs text-green-400 font-medium">
              Brain ran successfully — {lastResult.episodes_created} episode{lastResult.episodes_created !== 1 ? 's' : ''} created
            </p>
            {lastResult.decision?.today_theme && (
              <p className="text-[11px] text-muted-foreground mt-1">{lastResult.decision.today_theme}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
