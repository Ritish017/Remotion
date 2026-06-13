'use client'

import { BarChart3, TrendingUp, Eye, Heart, Share2, MessageCircle, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAllAnalytics } from '@/hooks/useAnalytics'
import { useCampaigns } from '@/hooks/useCampaign'
import { PLATFORM_COLORS, SOCIAL_PLATFORMS } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
  const { analytics, isLoading } = useAllAnalytics()
  const { campaigns } = useCampaigns()

  // Aggregate totals
  const totals = analytics.reduce(
    (acc, a) => ({
      views: acc.views + a.views,
      likes: acc.likes + a.likes,
      shares: acc.shares + a.shares,
      comments: acc.comments + a.comments,
    }),
    { views: 0, likes: 0, shares: 0, comments: 0 }
  )

  // By platform
  const byPlatform = SOCIAL_PLATFORMS.map(p => {
    const rows = analytics.filter(a => a.platform === p.id)
    return {
      name: p.label,
      views: rows.reduce((s, r) => s + r.views, 0),
      likes: rows.reduce((s, r) => s + r.likes, 0),
      color: p.color,
    }
  })

  const stats = [
    { label: 'Total Views', value: totals.views.toLocaleString(), icon: Eye, color: '#6c47ff' },
    { label: 'Total Likes', value: totals.likes.toLocaleString(), icon: Heart, color: '#e1306c' },
    { label: 'Total Shares', value: totals.shares.toLocaleString(), icon: Share2, color: '#00c9a7' },
    { label: 'Comments', value: totals.comments.toLocaleString(), icon: MessageCircle, color: '#f5c518' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 size={24} className="text-accent-ai" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Cross-campaign performance across all platforms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-bg-surface border-border-DEFAULT">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {analytics.length === 0 && !isLoading && (
        <Card className="bg-bg-surface border-border-DEFAULT">
          <CardContent className="py-24 text-center">
            <BarChart3 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No analytics data yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Post episodes and analytics will appear here once data is fetched from Ayrshare.
            </p>
          </CardContent>
        </Card>
      )}

      {analytics.length > 0 && (
        <>
          {/* Platform breakdown chart */}
          <Card className="bg-bg-surface border-border-DEFAULT">
            <CardHeader>
              <CardTitle className="text-sm">Views by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byPlatform}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <Tooltip
                    contentStyle={{ background: '#0e1014', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
                    labelStyle={{ color: '#f0f1f3' }}
                  />
                  <Bar dataKey="views" fill="#6c47ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Campaigns overview */}
      {campaigns.length > 0 && (
        <Card className="bg-bg-surface border-border-DEFAULT">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers size={14} />
              Campaigns Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.map(c => {
                const campAnalytics = analytics.filter(a =>
                  analytics.some(x => x.episode_id === a.episode_id)
                )
                const views = campAnalytics.reduce((s, a) => s + a.views, 0)
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.accent_color }} />
                    <span className="text-sm flex-1">{c.name}</span>
                    <span className="font-mono text-sm text-muted-foreground">{views.toLocaleString()} views</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded border border-border-DEFAULT capitalize"
                      style={{ color: c.accent_color }}
                    >
                      {c.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
