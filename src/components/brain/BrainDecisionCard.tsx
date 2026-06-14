'use client'

import { Brain, TrendingUp, Clock, Layers, AlertCircle, CheckCircle } from 'lucide-react'
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
  full_decision?: any
  world_context?: any
}

interface BrainDecisionCardProps {
  run: BrainRun
  accentColor?: string
}

export function BrainDecisionCard({ run, accentColor = '#6c47ff' }: BrainDecisionCardProps) {
  const confidenceColor =
    run.confidence >= 75 ? '#22c55e' :
    run.confidence >= 50 ? '#f5c518' :
    '#ef4444'

  const ranAt = new Date(run.ran_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const episodes = run.full_decision?.episodes || []
  const skipped = run.full_decision?.skip_today

  return (
    <Card className="bg-bg-surface border-border-DEFAULT overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accentColor }} />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20` }}>
              <Brain size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Today's Brain Decision</CardTitle>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ranAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {skipped ? (
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">Skipped</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                {run.episodes_created} episode{run.episodes_created !== 1 ? 's' : ''} created
              </Badge>
            )}
            <div
              className="font-mono text-sm font-bold tabular-nums"
              style={{ color: confidenceColor }}
              title="Brain confidence score"
            >
              {run.confidence}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Theme */}
        {run.today_theme && (
          <div className="flex items-start gap-2">
            <TrendingUp size={14} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm font-medium leading-relaxed">{run.today_theme}</p>
          </div>
        )}

        {/* Reasoning */}
        {run.reasoning && (
          <div className="bg-bg-surface2 rounded-lg p-3 border border-border-DEFAULT">
            <p className="text-xs text-muted-foreground leading-relaxed">{run.reasoning}</p>
          </div>
        )}

        {/* Episodes breakdown */}
        {episodes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Episodes planned</p>
            {episodes.map((ep: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT">
                <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ep.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-muted-foreground">{ep.episode_type}</span>
                    <span className="w-px h-3 bg-border-DEFAULT" />
                    <span className="font-mono text-[10px]" style={{
                      color: ep.urgency === 'breaking' ? '#ef4444' : ep.urgency === 'high' ? '#f5c518' : '#71717a'
                    }}>{ep.urgency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {skipped && run.full_decision?.skip_reason && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400">{run.full_decision.skip_reason}</p>
          </div>
        )}

        {/* Tomorrow preview */}
        {run.full_decision?.tomorrow_preview && (
          <div className="flex items-start gap-2 pt-2 border-t border-border-DEFAULT">
            <Clock size={12} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground italic">{run.full_decision.tomorrow_preview}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
