'use client'

import { useState, useEffect } from 'react'
import { Library, Search, Download, Play, Film, HardDrive, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function useLibrary() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/catalyst/library')
        const data = await res.json()
        setVideos(data.videos || [])
      } catch {}
      finally { setLoading(false) }
    }
    fetch_()
  }, [])

  return { videos, loading }
}

export default function LibraryPage() {
  const { videos, loading } = useLibrary()
  const [search, setSearch] = useState('')
  const [playing, setPlaying] = useState<string | null>(null)

  const filtered = videos.filter(v =>
    !search || (v.topic || v.job_id).toLowerCase().includes(search.toLowerCase())
  )

  const totalSizeMb = videos.reduce((s, v) => s + (v.total_size_mb || 0), 0)

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
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold">{videos.length} jobs</p>
            <p className="text-[11px] text-muted-foreground">{totalSizeMb.toFixed(0)} MB total</p>
          </div>
          <Badge variant="outline" className="font-mono">{videos.reduce((s, v) => s + v.segment_count, 0)} clips</Badge>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search videos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-bg-surface border-border-DEFAULT"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Library size={48} className="text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground mt-1">Generate videos from the Episode workspace</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video: any) => (
            <Card key={video.job_id} className="bg-bg-surface border-border-DEFAULT overflow-hidden group hover:border-border-strong transition-colors">
              {/* Preview area */}
              <div className="aspect-video bg-bg-surface2 relative overflow-hidden">
                {playing === video.job_id ? (
                  <iframe
                    src={`/api/catalyst/preview/${video.job_id}`}
                    className="w-full h-full border-0"
                    title="Video Preview"
                    allowFullScreen
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(video.job_id)}
                    className="w-full h-full flex items-center justify-center group/play cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative w-14 h-14 rounded-full bg-accent-brand/20 border border-accent-brand/30 flex items-center justify-center group-hover/play:bg-accent-brand/40 transition-colors">
                      <Play size={22} className="text-accent-brand ml-1" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                      <Layers size={10} className="text-white/60" />
                      <span className="text-[10px] text-white/60 font-mono">{video.segment_count} clips · {video.total_size_mb} MB</span>
                    </div>
                  </button>
                )}
              </div>

              <CardContent className="p-3 space-y-2">
                <div>
                  <p className="text-sm font-medium truncate" title={video.topic || video.job_id}>
                    {video.topic || '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{video.job_id.substring(0, 8)}…</span>
                    {video.palette && (
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 h-4">{video.palette}</Badge>
                    )}
                    {!video.tracked && (
                      <Badge variant="outline" className="text-[9px] text-yellow-500 border-yellow-500/30 px-1 py-0 h-4">orphan</Badge>
                    )}
                  </div>
                </div>

                {/* Segment download buttons */}
                <div className="flex flex-wrap gap-1">
                  {video.segments.map((seg: any) => (
                    <a
                      key={seg.index}
                      href={seg.url}
                      download
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border border-border-DEFAULT text-muted-foreground hover:text-foreground hover:border-border-strong hover:bg-bg-surface2 transition-colors"
                    >
                      <Download size={10} />
                      Clip {seg.index + 1}
                      <span className="text-[9px] opacity-60">({Math.round(seg.size / 1024 / 1024 * 10) / 10}MB)</span>
                    </a>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground font-mono">
                  {new Date(video.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {video.total_duration && ` · ${video.total_duration}s`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
