'use client'

import { History, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BrainRun {
  id: string
  run_date: string
  reasoning: string
  confidence: number
  today_theme: string
  episodes_created: number
  ran_at: string
}

interface BrainHistoryLogProps {
  runs: BrainRun[]
  accentColor?: string
}

export function BrainHistoryLog({ runs, accentColor = '#6c47ff' }: BrainHistoryLogProps) {
  if (!runs.length) {
    return (
      <Card className="bg-bg-surface border-border-DEFAULT">
        <CardContent className="py-8 text-center">
          <History size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">No brain runs yet. Trigger the brain to start.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-bg-surface border-border-DEFAULT">
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-2">
          <History size={16} className="text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Brain Run History</CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px] font-mono">{runs.length} runs</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border-DEFAULT">
          {runs.map((run) => {
            const confidenceColor =
              run.confidence >= 75 ? '#22c55e' :
              run.confidence >= 50 ? '#f5c518' :
              '#ef4444'

            const date = new Date(run.run_date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            })

            return (
              <div key={run.id} className="flex items-start gap-3 p-4 hover:bg-bg-surface2 transition-colors">
                {run.episodes_created > 0 ? (
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />
                ) : (
                  <XCircle size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{date}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: confidenceColor }}>
                      {run.confidence}%
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                      {run.episodes_created} ep{run.episodes_created !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {run.today_theme && (
                    <p className="text-xs font-medium truncate">{run.today_theme}</p>
                  )}

                  {run.reasoning && (
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {run.reasoning}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
