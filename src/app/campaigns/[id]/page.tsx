'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Brain, Zap, Trophy, Calendar, ChevronRight, Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCampaign, useCampaignEpisodes } from '@/hooks/useCampaign'
import { CAMPAIGN_TYPES, EPISODE_STATUS_CONFIG, SOCIAL_PLATFORMS } from '@/lib/constants'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Episode } from '@/lib/types'

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  'ai-teaching': Brain,
  'social-branding': Zap,
  'football': Trophy,
}

function EpisodeRow({ episode, accentColor, campaignId }: { episode: Episode; accentColor: string; campaignId: string }) {
  const router = useRouter()
  const config = EPISODE_STATUS_CONFIG[episode.status]

  return (
    <button
      onClick={() => router.push(`/campaigns/${campaignId}/episodes/${episode.id}`)}
      className="group w-full text-left"
    >
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-surface2 transition-colors border border-transparent hover:border-border-DEFAULT">
        {/* Episode number */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0"
          style={{ background: `${accentColor}15`, color: accentColor }}
        >
          {episode.episode_number}
        </div>

        {/* Title / topic */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {episode.title || episode.topic || `Episode ${episode.episode_number}`}
          </p>
          {episode.scheduled_date && (
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {new Date(episode.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Virality score */}
        {episode.virality_score !== undefined && episode.virality_score !== null && (
          <div className="text-right hidden sm:block">
            <p className="font-mono text-sm font-bold" style={{ color: accentColor }}>
              {episode.virality_score}
            </p>
            <p className="text-[10px] text-muted-foreground">virality</p>
          </div>
        )}

        {/* Status */}
        <StatusBadge status={episode.status} />

        <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </div>
    </button>
  )
}

// Calendar view: shows episodes on a monthly grid
function CampaignCalendar({ episodes, accentColor, campaignId }: { episodes: Episode[]; accentColor: string; campaignId: string }) {
  const router = useRouter()

  const episodesByDate: Record<string, Episode> = {}
  episodes.forEach(ep => {
    if (ep.scheduled_date) episodesByDate[ep.scheduled_date] = ep
  })

  // Build a 5-week grid from first episode date
  const firstDate = episodes.find(e => e.scheduled_date)?.scheduled_date
  if (!firstDate) return null

  const start = new Date(firstDate)
  // Align to Monday
  const dayOfWeek = start.getDay()
  start.setDate(start.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const cells: Date[] = []
  for (let i = 0; i < 35; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map(d => (
          <div key={d} className="text-center text-[10px] font-mono text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          const key = date.toISOString().split('T')[0]
          const episode = episodesByDate[key]
          const config = episode ? EPISODE_STATUS_CONFIG[episode.status] : null
          const isToday = key === new Date().toISOString().split('T')[0]

          return (
            <div
              key={i}
              onClick={() => episode && router.push(`/campaigns/${campaignId}/episodes/${episode.id}`)}
              className={`aspect-square rounded-md text-center flex flex-col items-center justify-center relative transition-all ${
                episode ? 'cursor-pointer hover:scale-105' : ''
              }`}
              style={episode && config ? { background: config.bgTint, borderWidth: 1, borderColor: config.color + '30' } : { background: 'rgba(255,255,255,0.02)' }}
            >
              <span className={`text-[10px] font-mono ${isToday ? 'text-accent-brand font-bold' : 'text-muted-foreground'}`}>
                {date.getDate()}
              </span>
              {episode && config && (
                <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: config.color }} />
              )}
              {episode && (
                <span className="text-[8px] text-muted-foreground mt-0.5 font-mono">
                  #{episode.episode_number}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { campaign, isLoading: campLoading } = useCampaign(id)
  const { episodes, isLoading: epsLoading } = useCampaignEpisodes(id)

  if (campLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-bg-surface2 rounded w-64" />
        <div className="h-40 bg-bg-surface rounded-xl" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button variant="outline" onClick={() => router.push('/campaigns')} className="mt-4">
          ← Back to Campaigns
        </Button>
      </div>
    )
  }

  const Icon = TYPE_ICONS[campaign.type] || Layers
  const typeConfig = CAMPAIGN_TYPES.find(t => t.id === campaign.type)
  const completedEps = episodes.filter(e => ['posted', 'analysed'].includes(e.status)).length
  const progress = episodes.length > 0 ? Math.round((completedEps / episodes.length) * 100) : 0

  // Status distribution for the legend
  const statusCounts: Record<string, number> = {}
  episodes.forEach(ep => {
    statusCounts[ep.status] = (statusCounts[ep.status] || 0) + 1
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb + back */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push('/campaigns')} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Campaigns
        </button>
        <span>/</span>
        <span className="text-foreground">{campaign.name}</span>
      </div>

      {/* Campaign hero */}
      <Card className="bg-bg-surface border-border-DEFAULT overflow-hidden">
        <div className="h-1" style={{ background: campaign.accent_color }} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${campaign.accent_color}20` }}
              >
                <Icon size={24} style={{ color: campaign.accent_color }} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{campaign.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{typeConfig?.label}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] h-5 border-current/20 bg-transparent"
                    style={{ color: campaign.accent_color }}
                  >
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-right hidden md:block">
              <p className="font-mono text-2xl font-bold">{progress}%</p>
              <p className="text-xs text-muted-foreground">{completedEps}/{episodes.length} posted</p>
            </div>
          </div>

          {campaign.description && (
            <p className="text-sm text-muted-foreground mt-4">{campaign.description}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            {campaign.start_date && campaign.end_date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(campaign.start_date).toLocaleDateString()} → {new Date(campaign.end_date).toLocaleDateString()}
              </span>
            )}
            {campaign.brand_voice && (
              <span>Voice: {campaign.brand_voice}</span>
            )}
            {campaign.target_audience && (
              <span>Audience: {campaign.target_audience}</span>
            )}
          </div>

          {/* Platform chips */}
          {campaign.target_platforms.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {campaign.target_platforms.map(p => {
                const platform = SOCIAL_PLATFORMS.find(sp => sp.id === p)
                return platform ? (
                  <span
                    key={p}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-border-DEFAULT"
                    style={{ color: platform.color }}
                  >
                    {platform.label}
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1 bg-bg-surface3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: campaign.accent_color }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar + Episode list side by side on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Calendar */}
        <Card className="bg-bg-surface border-border-DEFAULT xl:col-span-2">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Calendar size={14} />
              Content Calendar
            </h3>
            {epsLoading ? (
              <div className="animate-pulse h-40 bg-bg-surface2 rounded" />
            ) : (
              <>
                <CampaignCalendar episodes={episodes} accentColor={campaign.accent_color} campaignId={id} />
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const config = EPISODE_STATUS_CONFIG[status]
                    return config ? (
                      <span key={status} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
                        {config.label} ({count})
                      </span>
                    ) : null
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Episode list */}
        <Card className="bg-bg-surface border-border-DEFAULT xl:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Episodes ({episodes.length})</h3>
            </div>
            {epsLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-bg-surface2 rounded-lg" />
                ))}
              </div>
            ) : episodes.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">No episodes yet</p>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-[480px] overflow-y-auto pr-1">
                {episodes.map(ep => (
                  <EpisodeRow key={ep.id} episode={ep} accentColor={campaign.accent_color} campaignId={id} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
