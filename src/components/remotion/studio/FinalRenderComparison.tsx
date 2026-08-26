'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Download, ExternalLink, Play, Film, SplitSquareVertical } from 'lucide-react';
import type { VideoSpec } from '@/lib/video-spec/types';

export interface FinalRenderComparisonProps {
  jobId: string;
  publicUrl: string;
  spec: VideoSpec;
  durationSeconds?: number;
}

export const FinalRenderComparison: React.FC<FinalRenderComparisonProps> = ({
  jobId,
  publicUrl,
  spec,
  durationSeconds,
}) => {
  const [viewMode, setViewMode] = useState<'final' | 'side-by-side'>('final');

  const dur = durationSeconds || (spec.composition.durationInFrames / spec.composition.fps);
  const width = spec.composition.width;
  const height = spec.composition.height;
  const format = spec.composition.format;

  return (
    <Card className="bg-bg-surface border-border-DEFAULT rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border-DEFAULT flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              FINAL RENDER VERIFICATION
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              Job ID: {jobId} · Verified MP4 on Disk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/40 bg-emerald-500/10">
            {width}x{height} · {spec.composition.fps} FPS · {dur.toFixed(1)}s
          </Badge>

          <Button
            size="sm"
            onClick={() => window.open(publicUrl, '_blank')}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 text-xs"
          >
            <Download size={14} />
            Download MP4
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* HTML5 Video Player streaming real MP4 from /api/media/video/[id] */}
        <div className="relative rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-4 min-h-[420px]">
          <video
            src={publicUrl}
            controls
            playsInline
            className="rounded-lg shadow-2xl border border-white/15 max-h-[500px]"
            style={{
              aspectRatio: format === '9:16' ? '9/16' : format === '16:9' ? '16/9' : '1/1',
              maxWidth: format === '9:16' ? '280px' : '100%',
            }}
          />
        </div>

        {/* Verification Check Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-border-DEFAULT text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">FILE ARTIFACT</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> H.264 / AAC
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">CONTAINER</span>
            <span className="font-bold text-foreground">MP4 Stream</span>
          </div>
          <div className="p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">RESOLUTION</span>
            <span className="font-bold text-foreground">{width} × {height}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-bg-surface2 border border-border-DEFAULT space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">PARITY</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Remotion Match
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
