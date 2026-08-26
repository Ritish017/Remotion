'use client';

import React from 'react';
import { Volume2, Mic, Music, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AudioSystemSpec, NarrationData, WordTimestamp, SFXTrigger } from '@/lib/video-spec/types';

export interface AudioInspectorProps {
  audio?: AudioSystemSpec;
  narration?: NarrationData;
  currentFrame: number;
  fps?: number;
}

export const AudioInspector: React.FC<AudioInspectorProps> = ({
  audio,
  narration,
  currentFrame,
  fps = 30,
}) => {
  const currentTime = currentFrame / fps;

  // Calculate if speech is currently active at this timestamp
  const isSpeaking = narration?.words?.some((w: WordTimestamp) => {
    return currentTime >= w.start && currentTime <= w.end;
  });

  const baseMusicVol = audio?.musicVolume ?? 0.25;
  const duckingPct = audio?.duckingPercentage ?? 0.3;
  const currentMusicVol = isSpeaking
    ? baseMusicVol * (1 - duckingPct)
    : baseMusicVol;

  return (
    <div className="space-y-4">
      {/* Audio Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Voiceover Track */}
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Mic size={14} className="text-amber-400" />
              Voiceover Track
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                isSpeaking
                  ? 'border-amber-400/40 text-amber-300 bg-amber-500/10 animate-pulse'
                  : 'text-muted-foreground'
              }`}
            >
              {isSpeaking ? 'SPEAKING' : 'IDLE'}
            </Badge>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
            <div className="flex justify-between">
              <span>Volume:</span>
              <span className="text-foreground font-semibold">
                {Math.round((audio?.voiceoverVolume ?? 1.0) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Words:</span>
              <span className="text-foreground">{narration?.words?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Background Music Track */}
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Music size={14} className="text-accent-brand" />
              Background Music
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${
                isSpeaking
                  ? 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10'
                  : 'border-accent-brand/40 text-accent-brand bg-accent-brand/10'
              }`}
            >
              {isSpeaking ? 'DUCKED' : 'NORMAL'}
            </Badge>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
            <div className="flex justify-between">
              <span>Current Level:</span>
              <span className="text-foreground font-semibold">
                {Math.round(currentMusicVol * 100)}% ({Math.round(baseMusicVol * 100)}% base)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ducking Envelope:</span>
              <span className="text-foreground">-{Math.round(duckingPct * 100)}%</span>
            </div>
          </div>
        </div>

        {/* SFX Triggers */}
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles size={14} className="text-emerald-400" />
              SFX Cue Points
            </span>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10">
              {audio?.sfx?.length || 0} CUES
            </Badge>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
            <div className="flex justify-between">
              <span>Active Cue:</span>
              <span className="text-foreground">
                {audio?.sfx?.find((s: SFXTrigger) => Math.abs(s.frame - currentFrame) < 15)?.sfxId || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cue Points:</span>
              <span className="text-foreground">
                {audio?.sfx?.map((s: SFXTrigger) => `${(s.frame / fps).toFixed(1)}s`).join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
