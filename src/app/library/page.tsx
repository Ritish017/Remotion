'use client'

import { useState } from 'react'
import { Library, Search, Download, Play, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'

const BASE = process.env.NEXT_PUBLIC_CATALYST_URL || 'http://127.0.0.1:8000'

function useJobs() {
  return useSWR('jobs', () => fetch(`${BASE}/jobs`).then(r => r.json()).then(d => d.jobs || []))
}

export default function LibraryPage() {
  const { data: jobs = [], isLoading } = useJobs()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = jobs.filter((j: any) => {
    const matchesSearch = !search || JSON.stringify(j).toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const STATUS_COLORS: Record<string, string> = {
    done: '#22c55e',
    rendering: '#f5c518',
    queued: '#6c47ff',
    error: '#ef4444',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library size={24} className="text-accent-brand" />
            Video Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">All generated videos from the CATALYST engine</p>
        </div>
        <Badge variant="outline" className="font-mono">{filtered.length} videos</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-bg-surface border-border-DEFAULT"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'done', 'rendering', 'queued', 'error'].map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'bg-accent-brand text-white' : ''}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="bg-bg-surface border-border-DEFAULT animate-pulse">
              <div className="aspect-video bg-bg-surface2" />
              <CardContent className="p-3 space-y-2">
                <div className="h-4 bg-bg-surface2 rounded w-3/4" />
                <div className="h-3 bg-bg-surface2 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Library size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground mt-1">Generate videos from the Episode workspace</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((job: any) => {
            const color = STATUS_COLORS[job.status] || '#71717a'
            const narrative = job.narrative || {}
            const title = narrative.title || job.prompt?.split('\n')[0] || job.job_id

            return (
              <Card key={job.job_id} className="bg-bg-surface border-border-DEFAULT overflow-hidden group hover:border-border-strong transition-colors">
                {/* Thumbnail */}
                <div className="aspect-video bg-bg-surface2 relative overflow-hidden">
                  {job.status === 'done' ? (
                    <a
                      href={`${BASE}/preview/${job.job_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-full flex items-center justify-center group/play"
                    >
                      <div className="w-12 h-12 rounded-full bg-accent-brand/20 flex items-center justify-center group-hover/play:bg-accent-brand/40 transition-colors">
                        <Play size={20} className="text-accent-brand ml-0.5" />
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-2 h-2 rounded-full mx-auto mb-2"
                          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                        />
                        <p className="text-xs text-muted-foreground capitalize">{job.status}</p>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate" title={title}>{title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-current/20 bg-transparent capitalize"
                      style={{ color }}
                    >
                      {job.status}
                    </Badge>
                    {job.status === 'done' && (
                      <a href={`${BASE}/download/${job.job_id}`} download>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Download size={12} />
                        </Button>
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
