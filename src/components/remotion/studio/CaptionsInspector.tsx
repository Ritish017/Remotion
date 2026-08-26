'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import type { WordTimestamp, BrandDNA } from '@/lib/video-spec/types';

export interface CaptionsInspectorProps {
  words?: WordTimestamp[];
  currentFrame: number;
  fps?: number;
  brand?: BrandDNA;
  onSeekToTimestamp?: (seconds: number) => void;
}

export const CaptionsInspector: React.FC<CaptionsInspectorProps> = ({
  words = [],
  currentFrame,
  fps = 30,
  brand,
  onSeekToTimestamp,
}) => {
  const currentTime = currentFrame / fps;

  // Find active word
  const activeIndex = words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  const nearestIndex =
    activeIndex !== -1 ? activeIndex : words.findLastIndex((w) => currentTime >= w.start);

  return (
    <div className="space-y-4">
      {/* Header Stat */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface border border-border-DEFAULT">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-accent-brand" />
          <span className="text-xs font-bold text-foreground">
            Karaoke Caption Synchronization ({words.length} Words Aligned)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Clock size={13} className="text-zinc-400" />
          <span>Playhead: {currentTime.toFixed(2)}s</span>
        </div>
      </div>

      {/* Live Words Timeline & Inspector */}
      <div className="p-4 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-3">
        <div className="text-[11px] font-mono text-muted-foreground flex items-center justify-between">
          <span>Click any word to seek playhead</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> Monotonic Timestamps
          </span>
        </div>

        {words.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto p-2 bg-bg-surface2 rounded-lg border border-border-DEFAULT">
            {words.map((w, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < nearestIndex;
              return (
                <button
                  key={`${w.word}-${idx}`}
                  onClick={() => onSeekToTimestamp?.(w.start)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                    isActive
                      ? 'bg-amber-400 text-black font-extrabold border-amber-300 shadow-md scale-105'
                      : isPast
                      ? 'bg-bg-surface3/80 text-foreground border-border-DEFAULT hover:border-white/20'
                      : 'bg-bg-surface3/30 text-muted-foreground border-border-DEFAULT/60 hover:text-foreground'
                  }`}
                >
                  <span>{w.word}</span>
                  <span className="text-[9px] opacity-60 ml-1 font-normal">
                    {w.start.toFixed(1)}s
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No word-level captions present in this VideoSpec.
          </div>
        )}
      </div>
    </div>
  );
};
