'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, FileText, Video, Send, BarChart3, Clock, Flame, Loader2, Copy, Check, Download, Play, RotateCcw, AtSign, Play as Play2, Globe, Briefcase, AlertTriangle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useEpisode, updateEpisode, usePlatformPosts, upsertPlatformPost } from '@/hooks/useEpisode'
import { useCampaign } from '@/hooks/useCampaign'
import { AgentThinkingIndicator } from '@/components/shared/AgentThinkingIndicator'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { HashtagPill } from '@/components/shared/HashtagPill'
import { CopyButton } from '@/components/shared/CopyButton'
import { ApprovalGate } from '@/components/shared/ApprovalGate'
import { SCRIPT_AGENT_PROMPT, VIRALITY_AGENT_PROMPT, PLATFORM_COLORS, SOCIAL_PLATFORMS } from '@/lib/constants'
// Use direct API paths — never route through the Python CATALYST backend for video jobs
const videoPreviewUrl = (jobId: string) => `/api/catalyst/preview/${jobId}`
const videoDownloadUrl = (jobId: string, segment = 0) => `/api/catalyst/download/${jobId}?segment=${segment}`
const videoStatusUrl = (jobId: string) => `/api/catalyst/status/${jobId}`
import type { AgentStep, ResearchBrief, ScriptData, ViralityScore } from '@/lib/types'

// ─── Tab Navigation ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'research', label: 'Research', icon: Search },
  { id: 'script', label: 'Script', icon: FileText },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'distribute', label: 'Distribute', icon: Send },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

// ─── Research Panel ───────────────────────────────────────────────────────────
function ResearchPanel({ episodeId, campaignId, campaignType, research, topic: initialTopic, onSaved }: {
  episodeId: string
  campaignId: string
  campaignType: string
  research: ResearchBrief | Record<string, never>
  topic: string
  onSaved: () => void
}) {
  const [topic, setTopic] = useState(initialTopic)
  const [steps, setSteps] = useState<AgentStep[]>([
    { label: 'Searching YouTube for top videos', status: 'pending' },
    { label: 'Analysing competitor patterns', status: 'pending' },
    { label: 'Generating hook angles', status: 'pending' },
    { label: 'Compiling hashtag strategy', status: 'pending' },
  ])
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ResearchBrief | null>(
    Object.keys(research).length > 0 ? research as ResearchBrief : null
  )
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'youtube' | 'x' | 'linkedin'>('instagram')

  const updateStep = (i: number, status: AgentStep['status']) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status } : s))
  }

  const runResearch = async () => {
    if (!topic.trim()) return
    setRunning(true)
    setSteps(steps.map(s => ({ ...s, status: 'pending' })))

    try {
      updateStep(0, 'running')
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, campaignType }),
      })
      updateStep(0, 'done')
      updateStep(1, 'running')
      const data = await res.json()
      updateStep(1, 'done')
      updateStep(2, 'running')
      await new Promise(r => setTimeout(r, 400))
      updateStep(2, 'done')
      updateStep(3, 'running')
      await new Promise(r => setTimeout(r, 200))
      updateStep(3, 'done')

      if (data.research) {
        setResult(data.research)
        await updateEpisode(episodeId, {
          research: data.research,
          topic,
          status: 'researched',
        })
        onSaved()
      }
    } catch (e) {
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card className="bg-bg-surface2 border-border-DEFAULT">
        <CardContent className="p-4 space-y-3">
          <Label>Research Topic</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. How AI agents will replace developers in 2026"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runResearch()}
              className="bg-bg-surface border-border-DEFAULT flex-1"
            />
            <Button
              onClick={runResearch}
              disabled={running || !topic.trim()}
              className="bg-accent-brand hover:bg-accent-brand/90 gap-2 shrink-0"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Run Research
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent progress */}
      {(running || result) && (
        <AgentThinkingIndicator agentName="Research Agent" steps={steps} isRunning={running} />
      )}

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Topic summary + trend */}
          <Card className="bg-bg-surface2 border-border-DEFAULT">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Topic Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{result.topic_summary}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-bg-surface3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${result.trending_score ?? 0}%`,
                      background: (result.trending_score ?? 0) > 70 ? '#00c9a7' : (result.trending_score ?? 0) > 40 ? '#f5c518' : '#f0522a'
                    }}
                  />
                </div>
                <span className="font-mono text-sm font-bold">{result.trending_score ?? 0}/100</span>
                {result.trend_direction && (
                  <Badge variant="outline" className="text-[10px] border-border-DEFAULT bg-transparent capitalize">
                    {result.trend_direction}
                  </Badge>
                )}
              </div>
              {result.competitor_insights && (
                <p className="text-xs text-muted-foreground italic">{result.competitor_insights}</p>
              )}
            </CardContent>
          </Card>

          {/* Unique angle */}
          <Card className="bg-bg-surface2 border-border-DEFAULT">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap size={14} className="text-accent-ai" />
                Your Unique Angle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.unique_angle}</p>
              {result.what_to_avoid && Array.isArray(result.what_to_avoid) && result.what_to_avoid.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Avoid:</p>
                  <ul className="space-y-1">
                    {result.what_to_avoid.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hook angles */}
          <Card className="bg-bg-surface2 border-border-DEFAULT lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Hook Angles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.hook_angles && Array.isArray(result.hook_angles) && result.hook_angles.map((angle, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface border border-border-DEFAULT">
                  <div
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5"
                    style={{
                      background: `${(angle.predicted_virality ?? 0) > 70 ? '#00c9a7' : '#6c47ff'}20`,
                      color: (angle.predicted_virality ?? 0) > 70 ? '#00c9a7' : '#6c47ff'
                    }}
                  >
                    {angle.predicted_virality ?? 0}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{angle.angle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{angle.why}</p>
                  </div>
                  <CopyButton text={angle.angle} label="" size="sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hashtags */}
          <Card className="bg-bg-surface2 border-border-DEFAULT lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Hashtag Strategy</CardTitle>
                <div className="flex gap-1">
                  {(['instagram', 'youtube', 'x', 'linkedin'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${selectedPlatform === p ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
                      style={selectedPlatform === p ? { background: PLATFORM_COLORS[p] } : {}}
                    >
                      {p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {result.hashtags && result.hashtags[selectedPlatform] && Array.isArray(result.hashtags[selectedPlatform]) && (
                <div className="flex flex-wrap gap-2">
                  {result.hashtags[selectedPlatform].map(tag => (
                    <HashtagPill key={tag} tag={tag} />
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <CopyButton
                  text={((result.hashtags && result.hashtags[selectedPlatform]) || []).join(' ')}
                  label="Copy All"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ─── Script Panel ─────────────────────────────────────────────────────────────
function ScriptPanel({ episodeId, topic, episode, research, script: savedScript, onSaved }: {
  episodeId: string
  topic?: string
  episode: any
  research: ResearchBrief | Record<string, never>
  script: any | Record<string, never>
  onSaved: () => void
}) {
  const [feedback, setFeedback] = useState('')
  const [steps, setSteps] = useState<AgentStep[]>([
    { label: 'Analysing research brief', status: 'pending' },
    { label: 'Crafting viral hook (first 5 seconds)', status: 'pending' },
    { label: 'Writing main content script', status: 'pending' },
    { label: 'Optimising CTA per platform', status: 'pending' },
    { label: 'Generating platform-specific copy', status: 'pending' },
  ])
  const [running, setRunning] = useState(false)
  const [script, setScript] = useState<any | null>(
    Object.keys(savedScript).length > 0 ? savedScript : null
  )
  const [tone, setTone] = useState('Energetic')
  const [platform, setPlatform] = useState('youtube-long')
  const [duration, setDuration] = useState('60')
  const [activeSection, setActiveSection] = useState<'hook' | 'main' | 'voiceover' | 'cta' | 'meta'>('hook')

  const updateStep = (i: number, status: AgentStep['status']) => {
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status } : s))
  }

  const runScript = async () => {
    setRunning(true)
    setSteps(steps.map(s => ({ ...s, status: 'pending' })))
    try {
      updateStep(0, 'running')
      await new Promise(r => setTimeout(r, 300))
      updateStep(0, 'done')
      updateStep(1, 'running')

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          system: SCRIPT_AGENT_PROMPT,
          messages: [{
            role: 'user',
            content: `Topic: "${topic || 'Unknown topic'}"\nTone: ${tone}\nTarget platform: ${platform}\nTarget duration: ${duration} seconds\n\nStorytelling Prompt:\n${episode?.storytelling_prompt || 'None'}\n\nFeedback/Adjustments from user:\n${feedback || 'None'}\n\nResearch brief:\n${JSON.stringify(research, null, 2)}`
          }],
        }),
      })
      updateStep(1, 'done')
      updateStep(2, 'running')
      const data = await res.json()
      updateStep(2, 'done')
      updateStep(3, 'running')
      await new Promise(r => setTimeout(r, 200))
      updateStep(3, 'done')
      updateStep(4, 'running')
      await new Promise(r => setTimeout(r, 200))
      updateStep(4, 'done')

      if (data.result) {
        setScript(data.result)
        await updateEpisode(episodeId, {
          script: data.result,
          title: data.result.metadata?.youtube_title || topic,
          status: 'scripted',
        })
        onSaved()
      }
    } catch (e) {
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s))
    } finally {
      setRunning(false)
    }
  }

  const sectionTabs = [
    { id: 'hook' as const, label: 'Hook' },
    { id: 'main' as const, label: 'Content Map' },
    { id: 'voiceover' as const, label: 'Voiceover Script' },
    { id: 'cta' as const, label: 'CTA' },
    { id: 'meta' as const, label: 'Distribution Copy' },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-bg-surface2 border-border-DEFAULT">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Tone</Label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2"
              >
                {['Energetic', 'Educational', 'Conversational', 'Authoritative'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Platform Focus</Label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2"
              >
                <option value="youtube-long">YouTube Long</option>
                <option value="youtube-shorts">YouTube Shorts</option>
                <option value="instagram-reels">Instagram Reels</option>
                <option value="x">X (Twitter)</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Duration</Label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2"
              >
                <option value="15">15s</option>
                <option value="30">30s</option>
                <option value="60">60s</option>
                <option value="180">3 min</option>
                <option value="600">10 min</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 mt-4 mb-4">
             <Label className="text-xs">Feedback / Adjustments (Optional)</Label>
             <Textarea
               placeholder="e.g. Make it sound more urgent, or add a tip about async..."
               value={feedback}
               onChange={e => setFeedback(e.target.value)}
               className="bg-bg-surface border-border-DEFAULT text-sm"
               rows={2}
             />
          </div>
          <Button
            onClick={runScript}
            disabled={running || !topic}
            className="w-full bg-accent-brand hover:bg-accent-brand/90 gap-2"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {script ? 'Regenerate Script' : 'Generate Script'}
          </Button>
          {!topic && (
            <p className="text-xs text-muted-foreground text-center">Complete Research tab first to set the topic</p>
          )}
        </CardContent>
      </Card>

      {(running || script) && (
        <AgentThinkingIndicator agentName="Script Agent" steps={steps} isRunning={running} />
      )}

      {script && (
        <div className="space-y-4">
          {/* Section tabs */}
          <div className="flex gap-1 bg-bg-surface2 p-1 rounded-lg w-fit">
            {sectionTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeSection === tab.id
                    ? 'bg-accent-brand text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeSection === 'hook' && script.content_map && (
            <Card className="bg-bg-surface2 border-border-DEFAULT">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-accent-social" />
                    <span className="text-sm font-semibold">Hook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-accent-ai">{script.content_map.virality_score}/100</span>
                    <CopyButton text={script.content_map.hook?.headline} />
                  </div>
                </div>
                <div className="p-4 bg-bg-surface rounded-lg border border-border-DEFAULT">
                  <p className="text-base font-semibold leading-relaxed">{script.content_map.hook?.headline}</p>
                  <p className="text-sm text-muted-foreground mt-2">{script.content_map.hook?.subtext}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'main' && script.content_map && (
            <Card className="bg-bg-surface2 border-border-DEFAULT">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Content Map</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problem</p>
                  <p className="text-sm leading-relaxed font-semibold">{script.content_map.problem?.headline}</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    {script.content_map.problem?.bullets?.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 pt-4 border-t border-border-DEFAULT">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solution</p>
                  <p className="text-sm leading-relaxed font-semibold">{script.content_map.solution?.headline}</p>
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    {script.content_map.solution?.key_points?.map((b: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">{b}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'voiceover' && (
            <Card className="bg-bg-surface2 border-border-DEFAULT">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Voiceover Script</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>{script.metadata?.word_count} words</span>
                    <span>·</span>
                    <span>~{Math.round(script.metadata?.estimated_duration_seconds || 0)}s</span>
                  </div>
                </div>
                <div className="p-4 bg-bg-surface rounded-lg border border-border-DEFAULT whitespace-pre-wrap text-sm leading-relaxed">
                  {script.voiceover_script}
                </div>
                <div className="pt-2 border-t border-border-DEFAULT">
                  <CopyButton text={script.voiceover_script} label="Copy Voiceover Script" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'cta' && script.content_map && (
            <Card className="bg-bg-surface2 border-border-DEFAULT">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">CTA</p>
                <div className="p-4 bg-bg-surface rounded-lg border border-border-DEFAULT">
                  <p className="text-sm">{script.content_map.cta?.text}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Urgency: {script.content_map.cta?.urgency}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'meta' && (
            <div className="space-y-3">
              {/* YouTube */}
              <Card className="bg-bg-surface2 border-border-DEFAULT">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PLATFORM_COLORS.youtube }}>
                    <Play2 size={14} /> YouTube
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Title</p>
                    <p className="text-sm font-medium">{script.metadata.youtube_title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Title Variants</p>
                    {script.metadata.youtube_title_variants.map((v, i) => (
                      <p key={i} className="text-sm text-muted-foreground">• {v}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm whitespace-pre-line">{script.metadata.youtube_description}</p>
                  </div>
                  <CopyButton text={`${script.metadata.youtube_title}\n\n${script.metadata.youtube_description}`} label="Copy Title + Description" />
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card className="bg-bg-surface2 border-border-DEFAULT">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PLATFORM_COLORS.linkedin }}>
                      <Briefcase size={14} /> LinkedIn Post
                    </div>
                    <CopyButton text={script.metadata.linkedin_post} />
                  </div>
                  <p className="text-sm whitespace-pre-line">{script.metadata.linkedin_post}</p>
                </CardContent>
              </Card>

              {/* X Thread */}
              <Card className="bg-bg-surface2 border-border-DEFAULT">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PLATFORM_COLORS.x }}>
                      <Globe size={14} /> X Thread
                    </div>
                    <CopyButton text={script.metadata.x_thread.join('\n\n')} label="Copy Thread" />
                  </div>
                  <div className="space-y-2">
                    {script.metadata.x_thread.map((tweet, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-mono text-xs text-muted-foreground shrink-0 mt-1">{i + 1}/</span>
                        <p className="text-sm">{tweet}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Video Panel ──────────────────────────────────────────────────────────────
function VideoPanel({ episodeId, campaignType, topic, script, jobId, videoUrl, onSaved }: {
  episodeId: string
  campaignType: string
  topic?: string
  script: any | Record<string, never>
  jobId?: string
  videoUrl?: string
  onSaved: () => void
}) {
  const [generating, setGenerating] = useState(false)
  const [currentJobId, setCurrentJobId] = useState(jobId || '')
  const [status, setStatus] = useState<'idle' | 'queued' | 'rendering' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [palette, setPalette] = useState('tutorial-neon')
  const [motion, setMotion] = useState('kinetic')
  const [duration, setDuration] = useState('60')
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const previewUrl = currentJobId ? videoPreviewUrl(currentJobId) : undefined
  const downloadUrl = currentJobId ? videoDownloadUrl(currentJobId) : undefined

  const startPolling = useCallback((jid: string) => {
    const poll = async () => {
      try {
        const res = await fetch(videoStatusUrl(jid))
        const s = await res.json()
        if (s.status === 'done') {
          setStatus('done')
          setProgress('')
          await updateEpisode(episodeId, { video_job_id: jid, status: 'video_generated' })
          onSaved()
        } else if (s.status === 'error') {
          setStatus('error')
          setErrorMsg(s.message || 'Render failed')
        } else {
          setProgress(s.progress || 'Rendering…')
          pollRef.current = setTimeout(poll, 5000)
        }
      } catch {
        pollRef.current = setTimeout(poll, 10000)
      }
    }
    poll()
  }, [episodeId, onSaved])

  // Auto-resume if episode already has a job in progress
  useEffect(() => {
    if (jobId && !videoUrl) {
      setStatus('rendering')
      setProgress('Checking status…')
      startPolling(jobId)
    }
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [jobId, videoUrl, startPolling])

  const generate = async () => {
    if (!topic) return
    if (pollRef.current) clearTimeout(pollRef.current)
    setGenerating(true)
    setStatus('queued')
    setErrorMsg('')
    setProgress('')
    try {
      const scriptData = Object.keys(script).length > 0 ? script : null
      const contentMap = scriptData?.content_map || undefined

      const body = campaignType === 'football'
        ? { home: topic, away: 'TBD', competition: 'FIFA World Cup 2026', palette, content_map: contentMap }
        : campaignType === 'social-branding'
        ? { brief: scriptData?.content_map?.hook?.headline || topic, platform: 'reels', palette, content_map: contentMap }
        : { topic: scriptData?.content_map?.hook?.headline || topic, duration: parseInt(duration), palette, motion_preset: motion, content_map: contentMap }

      const endpoint = campaignType === 'football'
        ? '/api/catalyst/generate/sports/preview'
        : campaignType === 'social-branding'
        ? '/api/catalyst/generate/social'
        : '/api/catalyst/generate/tutorial'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      const newJobId = data.job_id
      if (!newJobId) throw new Error('No job ID returned')

      setCurrentJobId(newJobId)
      setStatus('rendering')
      setProgress('0 / 4 segments queued')
      startPolling(newJobId)
    } catch (e: any) {
      const msg = e?.message || String(e)
      if (msg.includes('Too many requests')) {
        // Check how many orphaned jobs are blocking
        try {
          const jobsRes = await fetch('/api/catalyst/jobs')
          const jobsData = await jobsRes.json()
          const blocking = jobsData.in_progress_total || 0
          setStatus('error')
          setErrorMsg(`Nova Reel is busy — ${blocking} segment${blocking !== 1 ? 's' : ''} still rendering from previous runs. Check the Generate page for status. Try again in ~10 min.`)
        } catch {
          setStatus('error')
          setErrorMsg('Nova Reel is busy with a previous job. Check the Generate page for status. Try again in ~10 min.')
        }
      } else {
        setStatus('error')
        setErrorMsg(msg)
      }
    } finally {
      setGenerating(false)
    }
  }

  const segmentMatch = progress.match(/(\d+)\/(\d+)/)
  const segmentsDone = segmentMatch ? parseInt(segmentMatch[1]) : 0
  const segmentsTotal = segmentMatch ? parseInt(segmentMatch[2]) : 4
  const pct = segmentsTotal > 0 ? Math.round((segmentsDone / segmentsTotal) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="bg-bg-surface2 border-border-DEFAULT">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Palette</Label>
              <select value={palette} onChange={e => setPalette(e.target.value)} className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2">
                {['tutorial-neon','tutorial-warm','ai-electric','ai-cyber','ai-fire','neon-purple','dark-bold'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Motion Preset</Label>
              <select value={motion} onChange={e => setMotion(e.target.value)} className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2">
                {['kinetic','smooth','dramatic','minimal'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Duration</Label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-9 bg-bg-surface border border-border-DEFAULT rounded-md text-sm px-2">
                <option value="15">15s</option>
                <option value="30">30s</option>
                <option value="45">45s</option>
                <option value="60">60s</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={generating || !topic || status === 'rendering'}
            className="w-full bg-accent-brand hover:bg-accent-brand/90 gap-2"
          >
            {generating
              ? <><Loader2 size={14} className="animate-spin" /> Queuing…</>
              : status === 'rendering'
              ? <><Loader2 size={14} className="animate-spin" /> Rendering — {progress || 'Starting…'}</>
              : <><Video size={14} /> Generate Video</>
            }
          </Button>

          {status === 'rendering' && (
            <div className="space-y-1.5">
              <div className="w-full bg-bg-surface rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-accent-brand transition-all duration-500"
                  style={{ width: segmentsTotal > 0 ? `${pct}%` : '15%' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[11px] text-muted-foreground font-mono">{progress}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {currentJobId.slice(0, 8)}… · Nova Reel ~5–10 min/segment
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-md bg-red-950/30 border border-red-900/40 p-3">
              <p className="text-xs text-red-400 font-medium mb-1">Generation failed</p>
              <p className="text-[11px] text-red-300/70 font-mono break-all">{errorMsg}</p>
              {errorMsg.includes('Too many requests') && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Nova Reel allows 1 job at a time. Wait for the previous job to finish, then try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video preview */}
      <Card className="bg-bg-surface2 border-border-DEFAULT">
        <CardContent className="p-4">
          {status === 'done' || videoUrl ? (
            <div className="space-y-3">
              <div className="aspect-video bg-bg-surface rounded-xl border border-border-DEFAULT overflow-hidden relative">
                {showPreview && previewUrl ? (
                  <iframe src={previewUrl} className="w-full h-full" title="Video Preview" allowFullScreen />
                ) : (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full h-full flex items-center justify-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-accent-brand/20 flex items-center justify-center group-hover:bg-accent-brand/30 transition-colors">
                      <Play size={28} className="text-accent-brand ml-1" />
                    </div>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-md border border-border-DEFAULT text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
                  >
                    <Download size={14} /> Download MP4
                  </a>
                )}
                <Button variant="outline" size="sm" className="gap-1.5" onClick={generate}>
                  <RotateCcw size={14} /> Regenerate
                </Button>
              </div>
              {currentJobId && <p className="font-mono text-[11px] text-muted-foreground">Job ID: {currentJobId}</p>}
            </div>
          ) : status === 'rendering' ? (
            <div className="aspect-video bg-bg-surface rounded-xl border border-border-DEFAULT flex items-center justify-center">
              <div className="text-center space-y-4 px-8">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-accent-brand/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-brand animate-spin" />
                  <Video size={24} className="absolute inset-0 m-auto text-accent-brand opacity-60" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Nova Reel generating…</p>
                  <p className="text-xs text-muted-foreground">{progress || 'Segments queued, rendering in background'}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Each 6s clip takes ~5–10 min. This page auto-updates.</p>
                </div>
                {segmentsTotal > 0 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: segmentsTotal }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i < segmentsDone ? 'bg-accent-brand' : 'bg-bg-surface2 border border-border-DEFAULT'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-bg-surface rounded-xl border border-border-DEFAULT flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Video size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Generate a video to preview it here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Distribution Panel ────────────────────────────────────────────────────────
function DistributionPanel({ episodeId, posts, script, research, videoJobId, onSaved }: {
  episodeId: string
  posts: any[]
  script: ScriptData | Record<string, never>
  research: ResearchBrief | Record<string, never>
  videoJobId?: string
  onSaved: () => void
}) {
  const [approval, setApproval] = useState<{ open: boolean; platform: string; caption: string; hashtags: string[] }>({
    open: false, platform: '', caption: '', hashtags: []
  })
  const [posting, setPosting] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const scriptData = Object.keys(script).length > 0 ? script as ScriptData : null
  const researchData = Object.keys(research).length > 0 ? research as ResearchBrief : null

  const platformConfig = [
    {
      id: 'instagram',
      icon: AtSign,
      caption: scriptData?.cta?.platform_variants?.instagram || '',
      hashtags: researchData?.hashtags?.instagram || [],
    },
    {
      id: 'youtube',
      icon: Play2,
      caption: scriptData?.metadata?.youtube_description || '',
      hashtags: researchData?.hashtags?.youtube || [],
      title: scriptData?.metadata?.youtube_title,
    },
    {
      id: 'x',
      icon: Globe,
      caption: scriptData?.cta?.platform_variants?.x || '',
      hashtags: researchData?.hashtags?.x || [],
    },
    {
      id: 'linkedin',
      icon: Briefcase,
      caption: scriptData?.metadata?.linkedin_post || '',
      hashtags: researchData?.hashtags?.linkedin || [],
    },
  ]

  const handlePost = async () => {
    if (!videoJobId) return
    setPosting(true)
    try {
      const videoUrl = videoDownloadUrl(videoJobId)
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: [approval.platform],
          mediaUrl: videoUrl,
          caption: approval.caption,
          hashtags: approval.hashtags,
          scheduleDate: scheduleDate || undefined,
          title: approval.platform === 'youtube' ? scriptData?.metadata.youtube_title : undefined,
          description: approval.platform === 'youtube' ? scriptData?.metadata.youtube_description : undefined,
        }),
      })
      const data = await res.json()
      if (data.status === 'success' || data.id) {
        await upsertPlatformPost({
          episode_id: episodeId,
          platform: approval.platform as any,
          caption: approval.caption,
          hashtags: approval.hashtags,
          status: scheduleDate ? 'scheduled' : 'posted',
          scheduled_at: scheduleDate || undefined,
          ayrshare_post_id: data.id,
        })
        await updateEpisode(episodeId, { status: 'scheduled' })
        onSaved()
      }
    } finally {
      setPosting(false)
      setApproval(a => ({ ...a, open: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {videoJobId ? 'Video ready to distribute' : 'Complete the Video tab first to enable posting'}
        </p>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Schedule for:</Label>
          <Input
            type="datetime-local"
            value={scheduleDate}
            onChange={e => setScheduleDate(e.target.value)}
            className="w-44 h-8 bg-bg-surface2 border-border-DEFAULT text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platformConfig.map(p => {
          const Icon = p.icon
          const color = PLATFORM_COLORS[p.id]
          const post = posts.find(po => po.platform === p.id)

          return (
            <Card key={p.id} className="bg-bg-surface2 border-border-DEFAULT">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color }}>
                    <Icon size={16} />
                    <span className="text-sm font-semibold">
                      {p.id === 'x' ? 'X (Twitter)' : p.id.charAt(0).toUpperCase() + p.id.slice(1)}
                    </span>
                  </div>
                  {post && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-current/20 bg-transparent"
                      style={{ color: post.status === 'posted' ? '#22c55e' : color }}
                    >
                      {post.status}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3">{p.caption || 'No caption — complete Script tab first'}</p>

                {p.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.hashtags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-muted-foreground">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                    {p.hashtags.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{p.hashtags.length - 4}</span>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  disabled={!videoJobId || !p.caption}
                  onClick={() => setApproval({ open: true, platform: p.id, caption: p.caption, hashtags: p.hashtags })}
                  className="w-full gap-1.5"
                  style={{ background: `${color}20`, color, borderColor: `${color}40` }}
                  variant="outline"
                >
                  <Send size={12} />
                  {scheduleDate ? 'Schedule' : 'Post Now'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ApprovalGate
        open={approval.open}
        onClose={() => setApproval(a => ({ ...a, open: false }))}
        onConfirm={handlePost}
        platform={approval.platform}
        caption={approval.caption}
        hashtags={approval.hashtags}
        scheduleTime={scheduleDate}
        isImmediate={!scheduleDate}
        isLoading={posting}
      />
    </div>
  )
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <BarChart3 size={48} className="mb-4 opacity-30" />
        <p className="text-sm">No posts yet. Distribute this episode first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Card key={post.id} className="bg-bg-surface2 border-border-DEFAULT">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3" style={{ color: PLATFORM_COLORS[post.platform] }}>
              <span className="text-sm font-semibold capitalize">{post.platform}</span>
              <Badge variant="outline" className="text-[10px] border-current/20 bg-transparent" style={{ color: PLATFORM_COLORS[post.platform] }}>
                {post.status}
              </Badge>
            </div>
            {post.post_url && (
              <a href={post.post_url} target="_blank" rel="noreferrer" className="text-xs text-accent-brand hover:underline">
                View Post →
              </a>
            )}
            {!post.post_url && (
              <p className="text-xs text-muted-foreground">Analytics will appear once the post is live.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Episode Workspace ────────────────────────────────────────────────────
export default function EpisodePage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>
}) {
  const { id: campaignId, episodeId } = use(params)
  const router = useRouter()
  const { episode, isLoading, mutate } = useEpisode(episodeId)
  const { campaign } = useCampaign(campaignId)
  const { posts, mutate: mutatePosts } = usePlatformPosts(episodeId)
  const [activeTab, setActiveTab] = useState('research')

  const handleSaved = () => {
    mutate()
    mutatePosts()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-bg-surface2 rounded w-80" />
        <div className="h-16 bg-bg-surface rounded-xl" />
        <div className="h-96 bg-bg-surface rounded-xl" />
      </div>
    )
  }

  if (!episode) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <p className="text-muted-foreground">Episode not found.</p>
        <Button variant="outline" onClick={() => router.push(`/campaigns/${campaignId}`)} className="mt-4">
          ← Back to Campaign
        </Button>
      </div>
    )
  }

  const accentColor = campaign?.accent_color || '#6c47ff'
  const research = episode.research as ResearchBrief | Record<string, never>
  const script = episode.script as ScriptData | Record<string, never>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.push('/campaigns')} className="hover:text-foreground transition-colors">Campaigns</button>
        <span>/</span>
        <button onClick={() => router.push(`/campaigns/${campaignId}`)} className="hover:text-foreground transition-colors">
          {campaign?.name || campaignId}
        </button>
        <span>/</span>
        <span className="text-foreground">Episode {episode.episode_number}</span>
      </div>

      {/* Episode header */}
      <Card className="bg-bg-surface border-border-DEFAULT overflow-hidden">
        <div className="h-0.5" style={{ background: accentColor }} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                {episode.episode_number}
              </div>
              <div>
                <h1 className="text-base font-semibold">
                  {episode.title || episode.topic || `Episode ${episode.episode_number}`}
                </h1>
                {episode.scheduled_date && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(episode.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {episode.virality_score !== undefined && episode.virality_score !== null && (
                <div className="text-right">
                  <p className="font-mono text-lg font-bold" style={{ color: accentColor }}>{episode.virality_score}</p>
                  <p className="text-[10px] text-muted-foreground">virality</p>
                </div>
              )}
              <StatusBadge status={episode.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-surface p-1 rounded-xl border border-border-DEFAULT overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { background: accentColor } : {}}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel content */}
      <div>
        {activeTab === 'research' && (
          <ResearchPanel
            episodeId={episodeId}
            campaignId={campaignId}
            campaignType={campaign?.type || 'ai-teaching'}
            research={research}
            topic={episode.topic || ''}
            onSaved={handleSaved}
          />
        )}
        {activeTab === 'script' && (
          <ScriptPanel
            episodeId={episodeId}
            topic={episode.topic}
            episode={episode}
            research={research}
            script={script}
            onSaved={handleSaved}
          />
        )}
        {activeTab === 'video' && (
          <VideoPanel
            episodeId={episodeId}
            campaignType={campaign?.type || 'ai-teaching'}
            topic={episode.topic}
            script={script}
            jobId={episode.video_job_id}
            videoUrl={episode.video_url}
            onSaved={handleSaved}
          />
        )}
        {activeTab === 'distribute' && (
          <DistributionPanel
            episodeId={episodeId}
            posts={posts}
            script={script}
            research={research}
            videoJobId={episode.video_job_id}
            onSaved={handleSaved}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPanel posts={posts} />
        )}
      </div>
    </div>
  )
}
