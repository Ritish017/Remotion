'use client'

import { useState, useEffect } from 'react'
import { GenerateForm } from '@/components/generate/GenerateForm'
import { BatchPlanner } from '@/components/generate/BatchPlanner'
import { NarrativeOutput } from '@/components/shared/NarrativeOutput'
import { NarrativeOutput as NarrativeOutputType, Job } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Film, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { generateTutorial, generateSocial, generateSportsPreview, generateBatch } from '@/lib/api'

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [narrative, setNarrative] = useState<NarrativeOutputType | null>(null)
  const [lastRequest, setLastRequest] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [inProgressTotal, setInProgressTotal] = useState(0)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/catalyst/jobs')
        const data = await res.json()
        setJobs(Array.isArray(data?.jobs) ? data.jobs : [])
        setInProgressTotal(data?.in_progress_total || 0)
      } catch (e) {
        console.error('Failed to fetch jobs', e)
      }
    }
    fetchJobs()
    const interval = setInterval(fetchJobs, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = async (data: any) => {
    setIsGenerating(true)
    setNarrative(null)
    setLastRequest(data)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: data.prompt,
          vertical: data.vertical,
          platform: data.platform,
          model: data.model
        })
      })
      const result = await res.json()
      if (res.ok) {
        setNarrative(result)
      } else {
        console.error(result.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendToCatalyst = async () => {
    if (!lastRequest || !narrative) return
    const { vertical, prompt, platform, duration } = lastRequest

    try {
      if (vertical === 'ai') {
        await generateTutorial({ topic: prompt, platform, duration: parseInt(duration) })
      } else if (vertical === 'social') {
        await generateSocial({ brief: prompt, platform })
      } else if (vertical === 'football') {
        await generateSportsPreview({ competition: prompt, home: 'Team A', away: 'Team B' }) // Mock parsing
      }
      // UI might show toast here
    } catch (e) {
      console.error(e)
    }
  }

  const handleQueueBatch = async (topics: string[], days: number) => {
    try {
      await generateBatch({ briefs: topics })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveTemplate = async () => {
    // If we had a job_id for this narrative, we would use it here.
    // For demo purposes, we will mock this call.
    console.log("Save as Template triggered")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Generate</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <GenerateForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          
          <BatchPlanner onQueueBatch={handleQueueBatch} />

          <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
            <CardHeader className="pb-3 border-b border-border-DEFAULT/50">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Nova Reel Jobs
                <div className="flex items-center gap-2">
                  {inProgressTotal > 0 && (
                    <Badge variant="outline" className="font-mono text-accent-brand border-accent-brand/30 bg-accent-brand/10 text-[10px] gap-1">
                      <Loader2 size={8} className="animate-spin" /> {inProgressTotal} rendering
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-mono bg-bg-surface2 text-muted-foreground border-border-strong text-[10px]">
                    Live
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto divide-y divide-border-DEFAULT/50">
                {jobs.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground font-mono text-sm">
                    No video jobs yet
                  </div>
                ) : (
                  jobs.map((job: any) => {
                    const pct = job.segments_total > 0 ? Math.round((job.segments_done / job.segments_total) * 100) : 0
                    return (
                      <div key={job.job_id} className="p-4 space-y-2 hover:bg-bg-surface2/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate">{job.topic || 'Untitled'}</p>
                              {job.orphaned && (
                                <Badge variant="outline" className="text-[9px] font-mono text-yellow-500 border-yellow-500/30 bg-yellow-500/10 shrink-0">orphan</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-muted-foreground">{job.job_id.substring(0, 8)}…</span>
                              {!job.orphaned && <><span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">{job.total_duration}s · {job.palette}</span></>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {job.status === 'done' && <CheckCircle2 size={14} className="text-accent-ai" />}
                            {job.status === 'rendering' && <Loader2 size={14} className="animate-spin text-accent-brand" />}
                            {job.status === 'error' && <AlertCircle size={14} className="text-destructive" />}
                            {job.status === 'unknown' && <Clock size={14} className="text-muted-foreground" />}
                            <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${
                              job.status === 'done' ? 'text-accent-ai border-accent-ai/30 bg-accent-ai/10' :
                              job.status === 'rendering' ? 'text-accent-brand border-accent-brand/30 bg-accent-brand/10' :
                              job.status === 'error' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                              'text-muted-foreground border-border-strong bg-transparent'
                            }`}>
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                        {job.status === 'rendering' && (
                          <div className="space-y-1">
                            <div className="w-full bg-bg-surface rounded-full h-1 overflow-hidden">
                              <div className="h-full bg-accent-brand transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground font-mono">{job.progress}</span>
                              <span className="text-[10px] text-muted-foreground">{pct}%</span>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: job.segments_total }).map((_: any, i: number) => (
                                <div key={i} className={`flex-1 h-1 rounded-full ${i < job.segments_done ? 'bg-accent-brand' : 'bg-border-DEFAULT'}`} />
                              ))}
                            </div>
                          </div>
                        )}
                        {job.status === 'done' && (
                          <div className="flex gap-2">
                            <a href={`/api/catalyst/download/${job.job_id}?segment=0`} download
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-border-DEFAULT text-muted-foreground hover:text-foreground transition-colors">
                              <Download size={11} /> Seg 1
                            </a>
                            {Array.from({ length: job.segments_total - 1 }).map((_: any, i: number) => (
                              <a key={i+1} href={`/api/catalyst/download/${job.job_id}?segment=${i+1}`} download
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-border-DEFAULT text-muted-foreground hover:text-foreground transition-colors">
                                <Download size={11} /> Seg {i+2}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {isGenerating ? (
            <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
              <Loader2 size={48} className="animate-spin text-accent-brand mb-4" />
              <h3 className="font-bold text-lg mb-2">Generating narrative…</h3>
              <p className="font-mono text-sm text-muted-foreground">Est. time: ~12 seconds</p>
            </Card>
          ) : narrative ? (
            <NarrativeOutput 
              narrative={narrative} 
              verticalId={lastRequest?.vertical || 'social'} 
              onSendToCatalyst={handleSendToCatalyst} 
              onSaveTemplate={handleSaveTemplate}
            />
          ) : (
            <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <div className="text-6xl mb-6 opacity-10">◈</div>
              <h3 className="font-bold text-lg text-foreground mb-2">Ready to Create</h3>
              <p className="text-sm max-w-xs mx-auto">Enter a brief and generate your narrative to get started.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
