'use client'

import { Globe, Zap, TrendingUp, Calendar, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WorldContextFeedProps {
  context: any
  accentColor?: string
}

export function WorldContextFeed({ context, accentColor = '#6c47ff' }: WorldContextFeedProps) {
  if (!context) return null

  const events = context.primary_events || []
  const topics = context.trending_topics || []
  const opportunities = context.opportunities || []

  const priorityColor = (p: string) =>
    p === 'breaking' ? '#ef4444' :
    p === 'high' ? '#f5c518' :
    p === 'normal' ? '#3b82f6' : '#71717a'

  return (
    <Card className="bg-bg-surface border-border-DEFAULT">
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Live World Context</CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px] font-mono">
            {context.date}
          </Badge>
        </div>
        {context.context_summary && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{context.context_summary}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary events */}
        {events.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Primary Events</p>
            <div className="space-y-1.5">
              {events.slice(0, 5).map((ev: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-bg-surface2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: priorityColor(ev.priority) }} />
                  <p className="text-xs leading-relaxed">{ev.description}</p>
                  <Badge
                    variant="outline"
                    className="text-[9px] shrink-0 py-0 h-4 border-current/20"
                    style={{ color: priorityColor(ev.priority) }}
                  >
                    {ev.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending topics */}
        {topics.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp size={10} /> Trending Topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {topics.slice(0, 8).map((t: any, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] border-border-DEFAULT bg-bg-surface2 font-normal"
                >
                  {typeof t === 'string' ? t.slice(0, 40) : t?.keyword?.slice(0, 40)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Campaign-specific extras */}
        {context.campaign_type === 'football' && context.tournament_stage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT">
            <Trophy size={14} style={{ color: '#f5c518' }} />
            <div>
              <p className="text-xs font-medium">FIFA WC 2026 — {context.tournament_stage?.replace(/_/g, ' ')}</p>
              {context.days_to_final > 0 && (
                <p className="text-[10px] text-muted-foreground">{context.days_to_final} days to the final</p>
              )}
            </div>
          </div>
        )}

        {context.campaign_type === 'social-branding' && context.trending_formats?.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap size={10} /> Viral Formats
            </p>
            <div className="space-y-1">
              {context.trending_formats.slice(0, 4).map((f: string, i: number) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                  {f}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="pt-2 border-t border-border-DEFAULT">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Opportunities</p>
            <div className="space-y-1">
              {opportunities.map((op: string, i: number) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: accentColor }} />
                  {op}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
