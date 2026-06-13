'use client'

import { useState, useEffect } from 'react'
import { GenerateForm } from '@/components/generate/GenerateForm'
import { BatchPlanner } from '@/components/generate/BatchPlanner'
import { NarrativeOutput } from '@/components/shared/NarrativeOutput'
import { NarrativeOutput as NarrativeOutputType, Job } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { getJobs, downloadJob, generateTutorial, generateSocial, generateSportsPreview, generateBatch, importJobAsTemplate } from '@/lib/api'

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [narrative, setNarrative] = useState<NarrativeOutputType | null>(null)
  const [lastRequest, setLastRequest] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs()
        setJobs(Array.isArray(data?.jobs) ? data.jobs : [])
      } catch (e) {
        console.error('Failed to fetch jobs', e)
      }
    }
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
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
                Recent Jobs
                <Badge variant="outline" className="font-mono bg-bg-surface2 text-muted-foreground border-border-strong text-[10px]">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-border-DEFAULT/50">
                {jobs.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground font-mono text-sm">
                    No recent jobs
                  </div>
                ) : (
                  jobs.map(job => (
                    <div key={job.job_id} className="p-4 flex items-center justify-between hover:bg-bg-surface2/50 transition-colors">
                      <div>
                        <div className="font-mono text-xs font-bold truncate w-32">{job.job_id.substring(0, 8)}...</div>
                        <div className="font-mono text-[10px] text-muted-foreground mt-1">
                          {new Date(job.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${
                          job.status === 'done' ? 'text-accent-ai border-accent-ai/30 bg-accent-ai/10' :
                          job.status === 'rendering' ? 'text-accent-brand border-accent-brand/30 bg-accent-brand/10' :
                          job.status === 'error' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                          'text-muted-foreground border-border-strong bg-transparent'
                        }`}>
                          {job.status}
                        </Badge>
                        {job.status === 'done' && (
                          <a href={downloadJob(job.job_id)} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Download size={14} />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
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
