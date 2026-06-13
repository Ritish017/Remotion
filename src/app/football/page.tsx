'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { PipelineTable } from '@/components/shared/PipelineTable'
import { CostCard } from '@/components/shared/CostCard'
import { ViralityCard } from '@/components/shared/ViralityCard'
import { HashtagCloud } from '@/components/shared/HashtagCloud'
import { VERTICALS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generateSportsPreview, getJobs } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Loader2, Zap } from 'lucide-react'
import { mapJobToPipelineItem, getJobPerformanceMetrics } from '@/lib/utils'

export default function FootballPage() {
  const accent = VERTICALS.find(v => v.id === 'football')?.accent || '#f5c518'
  const [fixtureId, setFixtureId] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [jobsData, setJobsData] = useState<any[]>([])

  const fetchJobs = () => {
    getJobs()
      .then(data => setJobsData(Array.isArray(data?.jobs) ? data.jobs : []))
      .catch(err => console.error('Failed to fetch jobs', err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const footballJobs = jobsData.filter(j => j?.family === 'fifa-sports' || j?.narrative?.content_type === 'sports')

  const pipelineData = footballJobs.map(mapJobToPipelineItem)

  const doneJobs = footballJobs.filter(j => j.status === 'done')
  const metrics = doneJobs.map(j => getJobPerformanceMetrics(j.job_id))
  
  let videosCount = footballJobs.length
  let avgViewsStr = "0"
  let bestCtrStr = "0.0%"
  let pipelineActiveStr = "0/0"
  let viralityScore = 0

  if (footballJobs.length > 0) {
    if (doneJobs.length > 0) {
      const totalViews = metrics.reduce((acc, m) => acc + m.views, 0)
      const avgViews = Math.round(totalViews / doneJobs.length)
      avgViewsStr = avgViews >= 1000 ? `${(avgViews / 1000).toFixed(1)}K` : avgViews.toString()
      
      const maxCtr = Math.max(...metrics.map(m => m.ctr))
      bestCtrStr = `${maxCtr.toFixed(1)}%`
      
      viralityScore = Math.round(metrics.reduce((acc, m) => acc + m.virality, 0) / doneJobs.length)
    }
    
    const activeCount = footballJobs.filter(j => j.status === 'queued' || j.status === 'rendering').length
    pipelineActiveStr = `${activeCount}/${footballJobs.length}`
  }

  let hashtags: { tag: string; hot: boolean }[] = []

  const collectedTagsSet = new Set<string>()
  footballJobs.forEach(j => {
    const tags = j.narrative?.narrative?.hashtags || j.narrative?.hashtags
    if (Array.isArray(tags)) {
      tags.forEach((tag: string) => {
        if (typeof tag === 'string') {
          collectedTagsSet.add(tag.startsWith('#') ? tag : `#${tag}`)
        }
      })
    }
  })
  
  if (collectedTagsSet.size > 0) {
    hashtags = Array.from(collectedTagsSet).slice(0, 12).map((tag, idx) => ({
      tag,
      hot: idx % 3 === 0
    }))
  }


  const handleFetch = async () => {
    if (!fixtureId) return
    setIsFetching(true)
    setTimeout(() => {
      setMatchData({
        home: 'Spain',
        away: 'Germany',
        competition: 'World Cup 2026 - Quarter Final',
        time: '2026-07-04 20:00:00',
        odds: '1.95 - 3.40 - 3.80'
      })
      setIsFetching(false)
    }, 1500)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await generateSportsPreview({
        fixture_id: parseInt(fixtureId),
        palette: 'fifa-gold'
      })
      setJobId(res.job_id)
      fetchJobs() // refresh immediately
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Football / FIFA</h1>
        <div className="h-3 w-3 rounded-full mt-1.5" style={{ backgroundColor: accent }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Videos This Month" value={isLoading ? 0 : videosCount} accentColor={accent} loading={isLoading} />
        <MetricCard label="Avg Views" value={isLoading ? "0" : avgViewsStr} accentColor={accent} loading={isLoading} />
        <MetricCard label="Best CTR" value={isLoading ? "0%" : bestCtrStr} accentColor={accent} loading={isLoading} />
        <MetricCard label="Pipeline" value={isLoading ? "0/0" : pipelineActiveStr} delta="active" deltaUp={true} accentColor={accent} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PipelineTable items={pipelineData} accent={accent} label="Football" />
          
          {/* Live Match Monitor */}
          <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
            <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />
            <CardHeader className="pb-3 border-b border-border-DEFAULT">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Live Match Monitor
                <Badge variant="outline" className="bg-bg-surface2 text-muted-foreground border-border-strong font-mono text-[10px]">
                  API-Football · Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex gap-3 mb-6">
                <Input 
                  placeholder="Enter Fixture ID (e.g. 718243)" 
                  value={fixtureId}
                  onChange={e => setFixtureId(e.target.value)}
                  className="font-mono bg-bg-surface2 border-border-strong max-w-sm"
                />
                <Button 
                  onClick={handleFetch} 
                  disabled={!fixtureId || isFetching}
                  variant="outline"
                  className="bg-transparent border-border-strong text-foreground hover:bg-bg-surface2 font-mono"
                >
                  {isFetching ? <Loader2 size={16} className="animate-spin" /> : 'Fetch'}
                </Button>
              </div>

              {matchData && (
                <div className="bg-bg-surface2 border border-border-DEFAULT rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{matchData.competition}</div>
                      <div className="text-2xl font-bold flex items-center gap-3">
                        <span>{matchData.home}</span>
                        <span className="text-muted-foreground text-base">vs</span>
                        <span>{matchData.away}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Kickoff</div>
                      <div className="font-mono text-sm">{matchData.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border-DEFAULT/50">
                    <div className="font-mono text-xs text-muted-foreground">Odds: {matchData.odds}</div>
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="font-mono text-xs h-8 text-black hover:opacity-90 shadow-none border-none"
                      style={{ backgroundColor: accent }}
                    >
                      {isGenerating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2" />}
                      Generate Preview Video
                    </Button>
                  </div>

                  {jobId && (
                    <div className="mt-3 p-3 bg-bg-surface3 rounded-md font-mono text-xs flex justify-between items-center border border-border-DEFAULT/50">
                      <span>Job queued: {jobId}</span>
                      <span className="text-accent-ai animate-pulse">Polling status...</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <CostCard />
          <ViralityCard score={isLoading ? 0 : viralityScore} accent={accent} />
        </div>
      </div>

      <HashtagCloud hashtags={hashtags} accent={accent} />
    </div>
  )
}

