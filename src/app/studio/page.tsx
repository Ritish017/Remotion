'use client';

import React from 'react';
import { RemotionProductionStudio } from '@/components/remotion/RemotionProductionStudio';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';

export default function StudioPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Catalyst Live Production Studio
        </h1>
        <p className="text-xs text-muted-foreground font-mono">
          Phase 4A: Real-time In-Browser Remotion Player · Proportional Timeline · Frame-Accurate Scrubbing · Claude AI Live Refinement
        </p>
      </div>

      <RemotionProductionStudio
        initialSpec={SAMPLE_SHOWCASE_SPEC}
        episodeTitle="Showcase 01: Silicon Breakthrough"
      />
    </div>
  );
}
