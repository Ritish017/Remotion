'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/shared/MetricCard'
import { PipelineTable } from '@/components/shared/PipelineTable'
import { CostCard } from '@/components/shared/CostCard'
import { ViralityCard } from '@/components/shared/ViralityCard'
import { HashtagCloud } from '@/components/shared/HashtagCloud'
import { VERTICALS } from '@/lib/constants'
import { getJobs } from '@/lib/api'
import { mapJobToPipelineItem, getJobPerformanceMetrics } from '@/lib/utils'

export default function AITeachingPage() {
  const accent = VERTICALS.find(v => v.id === 'ai')?.accent || '#00c9a7'
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

  const aiJobs = jobsData.filter(j => j?.family === 'tutorial-teaching' || j?.narrative?.content_type === 'tutorial')

  const pipelineData = aiJobs.map(mapJobToPipelineItem)

  const doneJobs = aiJobs.filter(j => j.status === 'done')
  const metrics = doneJobs.map(j => getJobPerformanceMetrics(j.job_id))
  
  let videosCount = aiJobs.length
  let avgViewsStr = "0"
  let bestCtrStr = "0.0%"
  let pipelineActiveStr = "0/0"
  let viralityScore = 0

  if (aiJobs.length > 0) {
    if (doneJobs.length > 0) {
      const totalViews = metrics.reduce((acc, m) => acc + m.views, 0)
      const avgViews = Math.round(totalViews / doneJobs.length)
      avgViewsStr = avgViews >= 1000 ? `${(avgViews / 1000).toFixed(1)}K` : avgViews.toString()
      
      const maxCtr = Math.max(...metrics.map(m => m.ctr))
      bestCtrStr = `${maxCtr.toFixed(1)}%`
      
      viralityScore = Math.round(metrics.reduce((acc, m) => acc + m.virality, 0) / doneJobs.length)
    }
    
    const activeCount = aiJobs.filter(j => j.status === 'queued' || j.status === 'rendering').length
    pipelineActiveStr = `${activeCount}/${aiJobs.length}`
  }

  let hashtags: { tag: string; hot: boolean }[] = []

  const collectedTagsSet = new Set<string>()
  aiJobs.forEach(j => {
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


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">AI Teaching</h1>
        <div className="h-3 w-3 rounded-full mt-1.5" style={{ backgroundColor: accent }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Videos This Month" value={isLoading ? 0 : videosCount} accentColor={accent} loading={isLoading} />
        <MetricCard label="Avg Views" value={isLoading ? "0" : avgViewsStr} accentColor={accent} loading={isLoading} />
        <MetricCard label="Best CTR" value={isLoading ? "0%" : bestCtrStr} accentColor={accent} loading={isLoading} />
        <MetricCard label="Pipeline" value={isLoading ? "0/0" : pipelineActiveStr} delta="active" deltaUp={true} accentColor={accent} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineTable items={pipelineData} accent={accent} label="AI Teaching" />
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

