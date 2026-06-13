'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { MiniBarChart } from '@/components/shared/MiniBarChart'
import { ScheduleTimeline, ScheduleSlot } from '@/components/shared/ScheduleTimeline'
import { VideoPerformanceList, VideoPerformance } from '@/components/shared/VideoPerformanceList'
import { getJobs } from '@/lib/api'
import { VERTICALS, MODELS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getJobPerformanceMetrics, mapModelNameToId } from '@/lib/utils'

const mockBarData = () => Array.from({ length: 12 }, () => ({ value: Math.floor(Math.random() * 100) + 20 }))

export default function OverviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [jobsData, setJobsData] = useState<any[]>([])

  useEffect(() => {
    const fetchJobs = () => {
      getJobs()
        .then(data => setJobsData(Array.isArray(data?.jobs) ? data.jobs : []))
        .catch(err => console.error('Failed to fetch jobs', err))
        .finally(() => setIsLoading(false))
    }
    fetchJobs()
    const interval = setInterval(fetchJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  const socialCount = jobsData.filter(j => j?.family === 'ai-social').length
  const aiCount = jobsData.filter(j => j?.family === 'tutorial-teaching').length
  const footballCount = jobsData.filter(j => j?.family === 'fifa-sports').length
  const total = socialCount + aiCount + footballCount

  let totalViewsNum = 0
  let avgVirality = 0

  const completedJobs = jobsData.filter(j => j.status === 'done')
  const metrics = completedJobs.map(j => getJobPerformanceMetrics(j.job_id))
  
  if (completedJobs.length > 0) {
    totalViewsNum = metrics.reduce((acc, m) => acc + m.views, 0)
    avgVirality = Math.round(metrics.reduce((acc, m) => acc + m.virality, 0) / completedJobs.length)
  }

  const monthlyCostNum = jobsData.reduce((acc, j) => {
    const modelId = mapModelNameToId(j.model)
    const modelData = MODELS.find(m => m.id === modelId)
    return acc + (modelData ? modelData.perVideo : 0.0001)
  }, 0)

  const formatViews = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
    return v.toString()
  }

  const totalViews = formatViews(totalViewsNum)
  const monthlyCost = `$${monthlyCostNum.toFixed(4)}`

  const scheduleSlots: ScheduleSlot[] = jobsData.slice(0, 5).map(j => {
    const time = new Date(j.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
    let title = j.prompt || 'Untitled Job'
    if (title.includes('\n')) {
      title = title.split('\n')[0].replace(/^(Tutorial video|Short-form AI social video for \w+|FIFA World Cup 2026 match preview):\s*/i, '').trim()
    }
    
    let status: 'done' | 'active' | 'upcoming' = 'upcoming'
    if (j.status === 'done') status = 'done'
    else if (j.status === 'rendering') status = 'active'
    else if (j.status === 'queued') status = 'upcoming'
    
    let platform: 'youtube' | 'reels' | 'tiktok' | 'shorts' = 'youtube'
    if (j.family === 'ai-social') {
      if (j.prompt.toLowerCase().includes('tiktok')) platform = 'tiktok'
      else if (j.prompt.toLowerCase().includes('shorts')) platform = 'shorts'
      else platform = 'reels'
    }
    
    return { time, title, status, platform }
  })

  const topVideos: VideoPerformance[] = completedJobs.map(j => {
    let title = j.prompt || 'Untitled Video'
    if (title.includes('\n')) {
      title = title.split('\n')[0].replace(/^(Tutorial video|Short-form AI social video for \w+|FIFA World Cup 2026 match preview):\s*/i, '').trim()
    }
    
    let vertical = 'Social Branding'
    let accent = '#f0522a'
    if (j.family === 'tutorial-teaching') {
      vertical = 'AI Teaching'
      accent = '#00c9a7'
    } else if (j.family === 'fifa-sports') {
      vertical = 'Football'
      accent = '#f5c518'
    }
    
    const perf = getJobPerformanceMetrics(j.job_id)
    return {
      id: j.job_id,
      title,
      vertical,
      accent,
      views: perf.views,
      ctr: perf.ctr
    }
  }).sort((a, b) => b.views - a.views)



  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Videos Generated" 
          value={isLoading ? 0 : total} 
          delta={`+${jobsData.filter(j => new Date(j.created_at).toDateString() === new Date().toDateString()).length} today`} 
          deltaUp={true} 
          accentColor="#6c47ff" 
          loading={isLoading}
        />
        <MetricCard 
          label="Total Views" 
          value={isLoading ? "0" : totalViews} 
          delta={`+${formatViews(Math.round(totalViewsNum * 0.02))} today`} 
          deltaUp={true} 
          accentColor="#6c47ff" 
          loading={isLoading}
        />
        <MetricCard 
          label="Monthly Cost" 
          value={isLoading ? "$0.0000" : monthlyCost} 
          delta={`$${(monthlyCostNum / (total || 1)).toFixed(5)}/video`} 
          accentColor="#6c47ff" 
          loading={isLoading}
        />
        <MetricCard 
          label="Avg Virality Score" 
          value={isLoading ? 0 : avgVirality} 
          delta="live" 
          deltaUp={false} 
          accentColor="#6c47ff" 
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Social Branding', count: socialCount, percent: Math.round((socialCount/total)*100), accent: '#f0522a' },
          { label: 'AI Teaching', count: aiCount, percent: Math.round((aiCount/total)*100), accent: '#00c9a7' },
          { label: 'Football', count: footballCount, percent: Math.round((footballCount/total)*100), accent: '#f5c518' },
        ].map(v => (
          <Card key={v.label} className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
            <div className="h-[2px] w-full" style={{ backgroundColor: v.accent }} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{v.label}</span>
                <Badge variant="outline" className="font-mono text-[10px] bg-bg-surface2 border-border-strong text-muted-foreground">{v.percent}%</Badge>
              </div>
              <div className="font-mono text-2xl font-bold" style={{ color: v.accent }}>{v.count} <span className="text-sm font-sans font-medium text-muted-foreground ml-1">videos</span></div>
              <MiniBarChart data={mockBarData()} color={v.accent} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <ScheduleTimeline slots={scheduleSlots} />
        <VideoPerformanceList videos={topVideos} />
      </div>
    </div>
  )
}
