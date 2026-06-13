import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface VideoPerformance {
  id: string
  title: string
  vertical: string
  accent: string
  views: number
  ctr: number
}

interface VideoPerformanceListProps {
  videos: VideoPerformance[]
}

export function VideoPerformanceList({ videos }: VideoPerformanceListProps) {
  const sortedVideos = [...videos].sort((a, b) => b.views - a.views)

  const formatViews = (views: number) => {
    return views >= 1000000 
      ? `${(views / 1000000).toFixed(1)}M` 
      : views >= 1000 
        ? `${(views / 1000).toFixed(1)}K` 
        : views.toString()
  }

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">Top Performing Videos</CardTitle>
      </CardHeader>
      <CardContent className={videos.length === 0 ? "p-6" : "p-0"}>
        {videos.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground font-mono">
            No completed videos
          </div>
        ) : (
          <div className="divide-y divide-border-DEFAULT/50">
            {sortedVideos.map((video, i) => (
              <div key={video.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-surface2/50 transition-colors">
                <div className="font-mono text-xs text-muted-foreground w-4">
                  {i + 1}
                </div>
                <div 
                  className="w-10 h-14 rounded overflow-hidden flex-shrink-0 border border-border-strong opacity-80"
                  style={{ backgroundColor: `${video.accent}30`, borderLeft: `2px solid ${video.accent}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate mb-1">{video.title}</div>
                  <Badge variant="outline" className="text-[9px] py-0 h-4 bg-transparent border-border-strong text-muted-foreground uppercase tracking-widest">
                    {video.vertical}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="font-mono text-sm font-bold">{formatViews(video.views)}</span>
                  <span className="font-mono text-[10px] text-accent-ai">{video.ctr.toFixed(1)}% CTR</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
