'use client'

import { useEffect, useState } from 'react'
import { AgentGrid } from '@/components/shared/AgentGrid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getJobs } from '@/lib/api'
import { getJobPerformanceMetrics } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Check, Copy } from 'lucide-react'

export default function AgentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [jobsData, setJobsData] = useState<any[]>([])
  
  // Interactive Agent states
  const [selectedAgentName, setSelectedAgentName] = useState<string | null>(null)
  const [runInput, setRunInput] = useState('')
  const [isRunningAgent, setIsRunningAgent] = useState(false)
  const [agentResult, setAgentResult] = useState<any | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [customAgentStatuses, setCustomAgentStatuses] = useState<Record<string, 'active' | 'idle' | 'warn'>>({})

  const fetchJobs = () => {
    getJobs()
      .then(data => setJobsData(Array.isArray(data?.jobs) ? data.jobs : []))
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const hasJobs = jobsData.length > 0
  const latestJob = hasJobs ? jobsData[0] : null
  const isAnyRendering = jobsData.some(j => j.status === 'queued' || j.status === 'rendering')

  const getRelativeTime = (isoString: string) => {
    const gap = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(gap / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const latestTimeText = latestJob ? getRelativeTime(latestJob.created_at) : 'Never'

  const baseAgentsData = [
    { 
      name: 'Virality Scorer', 
      status: isAnyRendering ? 'active' : (hasJobs ? 'idle' : 'idle') as 'active' | 'idle' | 'warn', 
      tag: 'Analysis', 
      lastTriggered: latestJob ? latestTimeText : 'Never', 
      description: 'Analyses hook strength, pacing, emotional triggers. Scores 0–100 before publish.' 
    },
    { 
      name: 'Hashtag Engine', 
      status: isAnyRendering ? 'active' : (hasJobs ? 'idle' : 'idle') as 'active' | 'idle' | 'warn', 
      tag: 'SEO', 
      lastTriggered: latestJob ? latestTimeText : 'Never', 
      description: 'Pulls trending tags from Instagram, TikTok, YouTube. Clusters by reach × relevance.' 
    },
    { 
      name: 'Title Optimizer', 
      status: isAnyRendering ? 'active' : (hasJobs ? 'idle' : 'idle') as 'active' | 'idle' | 'warn', 
      tag: 'Copywriting', 
      lastTriggered: latestJob ? latestTimeText : 'Never', 
      description: 'A/B tests title variants against CTR patterns. Rewrites for each platform\'s algorithm.' 
    },
    { 
      name: 'Views Analyst', 
      status: 'idle' as 'active' | 'idle' | 'warn', 
      tag: 'Analytics', 
      lastTriggered: latestJob ? getRelativeTime(new Date(new Date(latestJob.created_at).getTime() - 60000).toISOString()) : 'Never', 
      description: 'Ingests YouTube/IG analytics. Detects drop-off points, high-retention moments.' 
    },
    { 
      name: 'Description Writer', 
      status: isAnyRendering ? 'active' : (hasJobs ? 'idle' : 'idle') as 'active' | 'idle' | 'warn', 
      tag: 'Copywriting', 
      lastTriggered: latestJob ? latestTimeText : 'Never', 
      description: 'Generates keyword-rich descriptions + timestamps optimised for search indexing.' 
    },
    { 
      name: 'Thumbnail AI', 
      status: 'warn' as 'active' | 'idle' | 'warn', 
      tag: 'Vision', 
      lastTriggered: 'Never', 
      description: 'Suggests thumbnail crops, text overlays, face-expression prompts for CTR. Needs API key.' 
    },
    { 
      name: 'Trend Spotter', 
      status: 'active' as 'active' | 'idle' | 'warn', 
      tag: 'Research', 
      lastTriggered: '5m ago', 
      description: 'Monitors Twitter/X, Reddit, Google Trends for breakout topics in AI + Football.' 
    },
    { 
      name: '30-Day Planner', 
      status: isAnyRendering ? 'active' : ('idle' as 'active' | 'idle' | 'warn'), 
      tag: 'Strategy', 
      lastTriggered: latestJob ? latestTimeText : 'Never', 
      description: 'Builds content calendars, distributes topics across verticals, avoids saturation.' 
    },
  ]

  const agentsData = baseAgentsData.map(a => ({
    ...a,
    status: customAgentStatuses[a.name] !== undefined ? customAgentStatuses[a.name] : a.status
  }))

  const handleToggleAgent = (name: string) => {
    setCustomAgentStatuses(prev => {
      const current = prev[name] !== undefined ? prev[name] : baseAgentsData.find(a => a.name === name)?.status || 'idle'
      const next = current === 'active' ? 'idle' : 'active'
      return { ...prev, [name]: next }
    })
  }

  const handleOpenRunAgent = (name: string) => {
    setSelectedAgentName(name)
    setRunInput('')
    setAgentResult(null)
    setIsRunningAgent(false)
  }

  const handleExecuteAgent = async () => {
    if (!runInput.trim() || !selectedAgentName) return
    setIsRunningAgent(true)
    setAgentResult(null)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName: selectedAgentName, input: runInput })
      })
      const data = await res.json()
      if (res.ok) {
        setAgentResult(data)
      } else {
        setAgentResult({ error: data.error || 'Failed to execute agent' })
      }
    } catch (err) {
      setAgentResult({ error: 'Failed to contact agent server' })
    } finally {
      setIsRunningAgent(false)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const getAgentInputPlaceholder = (name: string) => {
    switch (name) {
      case 'Virality Scorer': return 'Enter video script, hook idea, or full description to score (e.g. "5 prompts that replaced my dev workflow...")'
      case 'Hashtag Engine': return 'Enter video topic or keywords (e.g. "React server components, Nextjs tutorial")'
      case 'Title Optimizer': return 'Enter your draft title or key concepts (e.g. "Explain RAG in 60s")'
      case 'Views Analyst': return 'Enter a video niche/format (e.g. "60-second Reels for AI coding tools")'
      case 'Description Writer': return 'Enter video brief (e.g. "Tutorial explaining how to write a custom NextJS middleware")'
      case 'Thumbnail AI': return 'Enter visual description or concept (e.g. "VS Code terminal screen with an error highlight")'
      case 'Trend Spotter': return 'Enter general field (e.g. "AI tools" or "Football World Cup")'
      case '30-Day Planner': return 'Enter content niche (e.g. "Python programming tutorials for beginners")'
      default: return 'Enter your brief or prompt here...'
    }
  }

  const renderAgentResult = (name: string, result: any) => {
    if (result.error) {
      return (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-mono">
          Error: {result.error}
        </div>
      )
    }

    switch (name) {
      case 'Virality Scorer':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-DEFAULT/50 pb-3">
              <span className="text-sm font-semibold text-muted-foreground">Estimated Virality Index:</span>
              <span className="text-3xl font-extrabold font-mono text-accent-brand">{result.score}/100</span>
            </div>
            {result.breakdown && (
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(result.breakdown).map(([key, val]: any) => (
                  <div key={key} className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{key}</span>
                    <span className="text-xs font-mono">{val}</span>
                  </div>
                ))}
              </div>
            )}
            {result.recommendations && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Optimization Checklist:</span>
                <ul className="space-y-1.5">
                  {result.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-2 bg-bg-surface3/40 p-2 rounded border border-border-DEFAULT/30">
                      <span className="text-accent-brand font-bold font-mono">#{i+1}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      case 'Hashtag Engine':
        return (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Clustered Hashtags:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.hashtags?.map((item: any, i: number) => (
                <div 
                  key={i} 
                  onClick={() => handleCopyToClipboard(item.tag)}
                  className="bg-bg-surface2 hover:bg-bg-surface3/60 p-2.5 rounded-lg border border-border-DEFAULT flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm font-bold text-accent-social">{item.tag}</span>
                    <span className="text-[9px] text-muted-foreground">{item.description}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] tracking-widest font-mono uppercase bg-bg-surface3">
                    {copiedText === item.tag ? <Check size={10} className="text-accent-ai" /> : item.reach}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )
      case 'Title Optimizer':
        return (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">High-CTR Title Variants:</div>
            <div className="space-y-2">
              {result.variants?.map((item: any, i: number) => (
                <div key={i} className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT flex flex-col gap-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[8px] font-mono tracking-widest uppercase bg-bg-surface3">
                      {item.platform}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-accent-ai">{item.predicted_ctr} CTR</span>
                  </div>
                  <div className="font-bold text-sm text-foreground pr-8">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">Trigger: {item.trigger}</div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleCopyToClipboard(item.title)}
                    className="absolute right-2 bottom-2 h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedText === item.title ? <Check size={12} className="text-accent-ai" /> : <Copy size={12} />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      case 'Views Analyst':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT flex flex-col">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Est. Retention</span>
                <span className="font-mono text-sm font-bold text-accent-ai">{result.estimated_duration}</span>
              </div>
              <div className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT flex flex-col">
                <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Drop-off Warning</span>
                <span className="font-mono text-[11px] font-medium text-accent-social truncate">{result.drop_off_warning}</span>
              </div>
            </div>
            {result.retention_highlights && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Engagement Guidelines:</span>
                <div className="space-y-1.5">
                  {result.retention_highlights.map((hl: string, i: number) => (
                    <div key={i} className="bg-bg-surface3/40 p-2.5 rounded border border-border-DEFAULT/30 text-xs font-mono">
                      {hl}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'Description Writer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Description:</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleCopyToClipboard(result.description)}
                  className="h-6 text-[10px] font-mono flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedText === result.description ? <Check size={10} className="text-accent-ai" /> : <Copy size={10} />}
                  Copy Description
                </Button>
              </div>
              <p className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT text-xs leading-relaxed text-muted-foreground">
                {result.description}
              </p>
            </div>
            {result.timestamps && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamps:</span>
                <div className="bg-bg-surface2 border border-border-DEFAULT rounded-lg divide-y divide-border-DEFAULT/50 font-mono text-xs">
                  {result.timestamps.map((ts: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-3 py-2">
                      <span className="text-accent-brand font-bold">{ts.time}</span>
                      <span className="text-muted-foreground">{ts.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'Thumbnail AI':
        return (
          <div className="space-y-4">
            <div className="bg-bg-surface2 p-4 rounded-lg border border-border-DEFAULT space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Visual Concept</span>
                <div className="text-sm font-semibold">{result.layout}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-DEFAULT/30">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Text Overlay</span>
                  <div className="text-sm font-mono font-bold text-accent-brand">{result.text_overlay}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Color Palette</span>
                  <div className="text-xs font-mono">{result.palette}</div>
                </div>
              </div>
            </div>
            {result.CTR_factor && (
              <div className="p-3 bg-bg-surface3/50 border border-border-DEFAULT rounded-lg text-xs font-mono text-muted-foreground">
                <strong>CTR Impact:</strong> {result.CTR_factor}
              </div>
            )}
          </div>
        )
      case 'Trend Spotter':
        return (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Breakout Niche Insights:</div>
            <div className="space-y-2">
              {result.trends?.map((item: any, i: number) => (
                <div key={i} className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT flex flex-col gap-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{item.trend}</span>
                    <Badge variant="outline" className="text-[8px] font-mono tracking-widest uppercase bg-bg-surface3 text-accent-brand border-accent-brand/30">
                      {item.growth}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">Idea: "{item.title_idea}"</div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleCopyToClipboard(item.title_idea)}
                    className="absolute right-2 bottom-2 h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedText === item.title_idea ? <Check size={12} className="text-accent-ai" /> : <Copy size={12} />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      case '30-Day Planner':
        return (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content Schedule Slots:</div>
            <div className="bg-bg-surface2 border border-border-DEFAULT rounded-lg divide-y divide-border-DEFAULT/50 font-mono text-xs overflow-hidden">
              {result.schedule?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-bg-surface3/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-[8px] font-mono tracking-widest uppercase bg-bg-surface3">
                      {item.day}
                    </Badge>
                    <span className="font-bold text-foreground">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.format}</span>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <pre className="p-3 bg-bg-surface2 border border-border-DEFAULT rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )
    }
  }

  const dynamicLogs: string[] = []

  if (hasJobs) {
    jobsData.slice(0, 10).forEach(j => {
      const time = new Date(j.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      const shortId = j.job_id.substring(0, 8)
      
      let topic = j.prompt || 'Untitled Video'
      if (topic.includes('\n')) {
        topic = topic.split('\n')[0].replace(/^(Tutorial video|Short-form AI social video for \w+|FIFA World Cup 2026 match preview):\s*/i, '').trim()
      }
      
      if (j.status === 'done') {
        const perf = getJobPerformanceMetrics(j.job_id)
        dynamicLogs.push(`${time} · Virality Scorer · Completed analysis of job_${shortId}. Score: ${perf.virality}/100`)
        dynamicLogs.push(`${time} · Description Writer · Created timestamps and descriptions for: "${topic}"`)
        dynamicLogs.push(`${time} · Hashtag Engine · Generated tags for job_${shortId}`)
      } else if (j.status === 'rendering') {
        dynamicLogs.push(`${time} · System · Rendering HyperFrames composition for job_${shortId}`)
        dynamicLogs.push(`${time} · Title Optimizer · Selecting layout variations for: "${topic}"`)
      } else if (j.status === 'queued') {
        dynamicLogs.push(`${time} · StoryAgent · Generating structured narrative arc from brief: "${topic}"`)
        dynamicLogs.push(`${time} · System · Video generation job_${shortId} queued successfully`)
      } else if (j.status === 'error') {
        dynamicLogs.push(`${time} · System · Job_${shortId} failed: "${j.error || 'unknown error'}"`)
      }
    })
    
    if (dynamicLogs.length < 5) {
      dynamicLogs.push(`09:30:00 · 30-Day Planner · Scanned content queue and scheduled new video slots`)
      dynamicLogs.push(`05:15:20 · Trend Spotter · Monitoring Twitter/X & Reddit for AI news`)
    }
  } else {
    dynamicLogs.push("21:40:00 · System · Standing by. Ready to execute creative pipelines.")
    dynamicLogs.push("21:30:00 · Trend Spotter · Monitoring Twitter/X, Reddit & Google Trends for breakout topics...")
    dynamicLogs.push("21:00:00 · Virality Scorer · Initialised virality scoring thresholds for vertical templates")
    dynamicLogs.push("20:45:00 · Description Writer · Agent stand-by mode active")
    dynamicLogs.push("20:30:00 · Hashtag Engine · Stand-by mode active")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Intelligence Agents</h1>
      
      <AgentGrid 
        agents={agentsData} 
        onRunAgent={handleOpenRunAgent} 
        onToggleAgent={handleToggleAgent} 
      />

      <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden mt-6">
        <CardHeader className="pb-3 border-b border-border-DEFAULT/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-brand"></span>
            </span>
            Agent Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[200px] overflow-y-auto p-4 space-y-2 font-mono text-xs text-muted-foreground">
            {dynamicLogs.map((log, i) => (
              <div key={i} className="hover:text-foreground transition-colors py-1 border-b border-border-DEFAULT/30 last:border-0">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Run Agent Dialog */}
      <Dialog open={selectedAgentName !== null} onOpenChange={(open) => !open && setSelectedAgentName(null)}>
        <DialogContent className="bg-bg-surface border-border-DEFAULT max-w-lg rounded-xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Sparkles size={16} className="text-accent-brand" />
              Run Agent: {selectedAgentName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Interact with this creative intelligence agent. Submit your brief below to receive a live structured output.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Agent Brief/Input:</span>
              {selectedAgentName === 'Virality Scorer' ? (
                <Textarea 
                  placeholder={getAgentInputPlaceholder(selectedAgentName)}
                  value={runInput}
                  onChange={(e) => setRunInput(e.target.value)}
                  className="bg-bg-surface2 border-border-strong text-xs font-mono h-24"
                />
              ) : (
                <Input 
                  placeholder={getAgentInputPlaceholder(selectedAgentName || '')}
                  value={runInput}
                  onChange={(e) => setRunInput(e.target.value)}
                  className="bg-bg-surface2 border-border-strong text-xs font-mono"
                />
              )}
            </div>

            {agentResult && (
              <div className="border-t border-border-DEFAULT/50 pt-4 space-y-3">
                <span className="text-xs font-semibold text-muted-foreground block">Agent Output:</span>
                {renderAgentResult(selectedAgentName || '', agentResult)}
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAgentName(null)}
              className="text-xs border-border-strong font-mono h-9"
              disabled={isRunningAgent}
            >
              Close
            </Button>
            <Button 
              onClick={handleExecuteAgent}
              disabled={isRunningAgent || !runInput.trim()}
              className="text-xs bg-accent-brand text-foreground hover:opacity-90 font-mono h-9 shadow-none border-none"
            >
              {isRunningAgent ? (
                <>
                  <Loader2 size={12} className="mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Sparkles size={12} className="mr-2" />
                  Run Pipeline
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


