'use client'

import { useState } from 'react'
import { Play, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  previewUrl?: string
  downloadUrl?: string
  jobId?: string
  onRegenerate?: () => void
}

export function VideoPlayer({ previewUrl, downloadUrl, jobId, onRegenerate }: VideoPlayerProps) {
  const [showPreview, setShowPreview] = useState(false)

  if (!previewUrl) {
    return (
      <div className="aspect-video bg-bg-surface2 rounded-xl border border-border-DEFAULT flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Play size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Generate a video to preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video bg-bg-surface2 rounded-xl border border-border-DEFAULT overflow-hidden relative">
        {showPreview ? (
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title="Video Preview"
            allowFullScreen
          />
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
            <Download size={14} />
            Download MP4
          </a>
        )}
        {onRegenerate && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onRegenerate}>
            <RotateCcw size={14} />
            Regenerate
          </Button>
        )}
      </div>
      {jobId && (
        <p className="font-mono text-[11px] text-muted-foreground">
          Job ID: {jobId}
        </p>
      )}
    </div>
  )
}
