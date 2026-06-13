'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Brain, Zap, Trophy, Layers, Calendar, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCampaigns, createCampaign, createEpisodeStubs } from '@/hooks/useCampaign'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUS_COLORS, SOCIAL_PLATFORMS, ACCENT_COLORS } from '@/lib/constants'
import type { Campaign, CampaignType } from '@/lib/types'

const TYPE_ICONS = {
  'ai-teaching': Brain,
  'social-branding': Zap,
  'football': Trophy,
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter()
  const typeConfig = CAMPAIGN_TYPES.find(t => t.id === campaign.type)
  const Icon = TYPE_ICONS[campaign.type] || Layers
  const statusColor = CAMPAIGN_STATUS_COLORS[campaign.status] || '#71717a'

  const start = campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
  const end = campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  return (
    <button
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
      className="group text-left w-full"
    >
      <Card className="bg-bg-surface border-border-DEFAULT hover:border-border-strong transition-all duration-200 hover:shadow-lg hover:shadow-black/20 overflow-hidden relative">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: campaign.accent_color }}
        />
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${campaign.accent_color}20` }}
              >
                <Icon size={18} style={{ color: campaign.accent_color }} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold leading-tight group-hover:text-white transition-colors">
                  {campaign.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{typeConfig?.label}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] py-0 h-5 shrink-0 border-current/20 bg-transparent"
              style={{ color: statusColor }}
            >
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {start} → {end}
            </span>
          </div>

          {campaign.target_platforms.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {campaign.target_platforms.map(p => {
                const platform = SOCIAL_PLATFORMS.find(sp => sp.id === p)
                if (!platform) return null
                return (
                  <span
                    key={p}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-DEFAULT"
                    style={{ color: platform.color }}
                  >
                    {platform.label}
                  </span>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </button>
  )
}

function CreateCampaignModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'ai-teaching' as CampaignType,
    description: '',
    brand_voice: '',
    target_audience: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    target_platforms: ['instagram', 'youtube'] as string[],
    accent_color: '#6c47ff',
    episode_count: 30,
  })

  const togglePlatform = (id: string) => {
    setForm(f => ({
      ...f,
      target_platforms: f.target_platforms.includes(id)
        ? f.target_platforms.filter(p => p !== id)
        : [...f.target_platforms, id],
    }))
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const campaign = await createCampaign({
        name: form.name,
        type: form.type,
        description: form.description,
        brand_voice: form.brand_voice,
        target_audience: form.target_audience,
        start_date: form.start_date,
        end_date: form.end_date,
        target_platforms: form.target_platforms,
        accent_color: form.accent_color,
        status: 'planning',
      })
      if (form.episode_count > 0 && form.start_date) {
        await createEpisodeStubs(campaign.id, form.episode_count, form.start_date)
      }
      onCreated()
      onClose()
      setStep(1)
    } catch (err: any) {
      alert(`Failed to create campaign: ${err?.message || 'Check your Supabase API keys in Settings.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-border-DEFAULT max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={18} className="text-accent-brand" />
            New Campaign
            <span className="ml-auto font-mono text-xs text-muted-foreground">Step {step}/2</span>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g. AI Agents Explained — June 2026"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-bg-surface2 border-border-DEFAULT"
              />
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {CAMPAIGN_TYPES.map(type => {
                  const Icon = TYPE_ICONS[type.id]
                  return (
                    <button
                      key={type.id}
                      onClick={() => setForm(f => ({ ...f, type: type.id, accent_color: type.accent }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        form.type === type.id
                          ? 'border-current/40 bg-current/10'
                          : 'border-border-DEFAULT bg-bg-surface2 hover:border-border-strong'
                      }`}
                      style={form.type === type.id ? { color: type.accent } : {}}
                    >
                      <Icon size={20} className="mx-auto mb-1" />
                      <p className="text-xs font-medium">{type.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What is this campaign about?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="bg-bg-surface2 border-border-DEFAULT resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="bg-bg-surface2 border-border-DEFAULT"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  className="bg-bg-surface2 border-border-DEFAULT"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!form.name}
              className="w-full bg-accent-brand hover:bg-accent-brand/90"
            >
              Next →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`p-2.5 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                      form.target_platforms.includes(p.id)
                        ? 'border-current/40 bg-current/10'
                        : 'border-border-DEFAULT bg-bg-surface2 hover:border-border-strong text-muted-foreground'
                    }`}
                    style={form.target_platforms.includes(p.id) ? { color: p.color } : {}}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <Input
                placeholder="e.g. Energetic, educational, no fluff"
                value={form.brand_voice}
                onChange={e => setForm(f => ({ ...f, brand_voice: e.target.value }))}
                className="bg-bg-surface2 border-border-DEFAULT"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g. Developers learning about AI agents"
                value={form.target_audience}
                onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                className="bg-bg-surface2 border-border-DEFAULT"
              />
            </div>

            <div className="space-y-2">
              <Label>Episode Count (auto-generated stubs)</Label>
              <Input
                type="number"
                min="0"
                max="90"
                value={form.episode_count}
                onChange={e => setForm(f => ({ ...f, episode_count: parseInt(e.target.value) || 0 }))}
                className="bg-bg-surface2 border-border-DEFAULT"
              />
            </div>

            <div className="space-y-2">
              <Label>Accent Colour</Label>
              <div className="flex gap-2">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, accent_color: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: form.accent_color === c ? 'white' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading || form.target_platforms.length === 0}
                className="flex-1 bg-accent-ai hover:bg-accent-ai/90 text-black"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const { campaigns, isLoading, mutate } = useCampaigns()
  const [showCreate, setShowCreate] = useState(false)

  const active = campaigns.filter(c => c.status === 'active')
  const planning = campaigns.filter(c => c.status === 'planning')
  const completed = campaigns.filter(c => c.status === 'completed' || c.status === 'paused')

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Each campaign is a 30-day content series. Episodes live inside campaigns.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-accent-brand hover:bg-accent-brand/90 gap-2"
        >
          <Plus size={16} />
          New Campaign
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: active.length, color: '#00c9a7', icon: TrendingUp },
          { label: 'Planning', value: planning.length, color: '#6c47ff', icon: Target },
          { label: 'Completed', value: completed.length, color: '#22c55e', icon: Layers },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-bg-surface border-border-DEFAULT">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-bg-surface border-border-DEFAULT animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && campaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-brand/10 flex items-center justify-center mb-4">
            <Layers size={32} className="text-accent-brand" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No campaigns yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create your first campaign to start building a content series. Each campaign generates episode stubs for the entire run.
          </p>
          <Button onClick={() => setShowCreate(true)} className="bg-accent-brand hover:bg-accent-brand/90 gap-2">
            <Plus size={16} />
            Create First Campaign
          </Button>
        </div>
      )}

      {/* Active campaigns */}
      {active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-ai animate-pulse" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      )}

      {/* Planning campaigns */}
      {planning.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Planning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planning.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      )}

      {/* Completed campaigns */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Completed / Paused</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      )}

      <CreateCampaignModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={mutate}
      />
    </div>
  )
}
