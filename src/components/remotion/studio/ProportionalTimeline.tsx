'use client';

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';
import type { VideoSpec, SceneData } from '@/lib/video-spec/types';

export interface ProportionalTimelineProps {
  spec: VideoSpec;
  currentFrame: number;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onSeekToFrame?: (frame: number) => void;
}

export const ProportionalTimeline: React.FC<ProportionalTimelineProps> = ({
  spec,
  currentFrame,
  activeSceneIndex,
  onSelectScene,
  onSeekToFrame,
}) => {
  const totalFrames = spec.composition.durationInFrames || 1;
  const fps = spec.composition.fps || 30;

  const formatTime = (frames: number) => {
    const totalSec = frames / fps;
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const playheadPct = Math.min(100, Math.max(0, (currentFrame / totalFrames) * 100));
  const currentScene = spec.scenes[activeSceneIndex] || spec.scenes[0];

  return (
    <div className="p-4 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5">
          <Layers size={14} className="text-accent-brand" />
          Proportional Scene Timeline ({spec.scenes.length} Scenes · {(totalFrames / fps).toFixed(1)}s Total)
        </span>
        <span className="font-mono text-[11px] text-accent-brand">
          Scene {currentScene?.sceneNumber || 1}: {currentScene?.title}
        </span>
      </div>

      {/* Main Proportional Scene Blocks Strip */}
      <div className="relative h-24 w-full bg-bg-surface2 rounded-xl p-1 border border-border-DEFAULT flex gap-1 overflow-hidden select-none">
        {spec.scenes.map((scene, idx) => {
          const widthPct = Math.max(8, (scene.durationFrames / totalFrames) * 100);
          const isActive = idx === activeSceneIndex;
          const isPlayheadHere =
            currentFrame >= scene.startFrame &&
            currentFrame < scene.startFrame + scene.durationFrames;
          const startSec = (scene.startFrame / fps).toFixed(1);
          const endSec = ((scene.startFrame + scene.durationFrames) / fps).toFixed(1);
          const durSec = (scene.durationFrames / fps).toFixed(1);

          return (
            <button
              key={scene.id || idx}
              onClick={() => onSelectScene(idx)}
              style={{ width: `${widthPct}%` }}
              className={`relative h-full rounded-lg p-2 text-left transition-all flex flex-col justify-between overflow-hidden border ${
                isActive
                  ? 'bg-accent-brand/25 border-accent-brand text-white shadow-md ring-1 ring-accent-brand/50'
                  : isPlayheadHere
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-bg-surface3/60 border-border-DEFAULT text-muted-foreground hover:bg-bg-surface3 hover:text-foreground'
              }`}
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-[10px] font-extrabold tracking-wider">
                  0{scene.sceneNumber}
                </span>
                <span className="text-[9px] font-mono opacity-70 truncate max-w-[60px]">
                  {durSec}s
                </span>
              </div>

              {/* Title & Template */}
              <div className="space-y-0.5 my-auto">
                <div className="text-[11px] font-bold leading-tight truncate text-foreground">
                  {scene.title || scene.visualLanguage || scene.type}
                </div>
                <div className="text-[9px] font-mono text-accent-brand truncate opacity-90">
                  {scene.templateId || scene.visualLanguage}
                </div>
              </div>

              {/* Footer Time Range */}
              <div className="text-[8px] font-mono text-zinc-400 opacity-80 truncate">
                {startSec}s → {endSec}s
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-brand" />
              )}
            </button>
          );
        })}

        {/* Global Timeline Draggable Playhead Marker */}
        <div
          style={{ left: `${playheadPct}%` }}
          className="absolute top-0 bottom-0 w-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none z-30 transition-all duration-75"
        >
          <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border border-white shadow flex items-center justify-center text-[7px] text-white font-bold" />
        </div>
      </div>

      {/* Visual Beats Sub-track if present in active scene */}
      {currentScene?.visualBeats && currentScene.visualBeats.length > 0 && (
        <div className="pt-2 border-t border-border-DEFAULT space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-teal-400" />
              Visual Beats (Scene 0{currentScene.sceneNumber})
            </span>
            <span>Click beat to seek</span>
          </div>

          <div className="flex gap-1.5">
            {currentScene.visualBeats.map((beat, bIdx) => {
              const beatAbsoluteStart = currentScene.startFrame + beat.startFrame;
              const isBeatActive =
                currentFrame >= beatAbsoluteStart &&
                currentFrame < beatAbsoluteStart + beat.durationInFrames;

              return (
                <button
                  key={beat.id || bIdx}
                  onClick={() => onSeekToFrame?.(beatAbsoluteStart)}
                  className={`flex-1 p-2 rounded-md text-left transition-all border ${
                    isBeatActive
                      ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                      : 'bg-bg-surface2 hover:bg-bg-surface3 border-border-DEFAULT text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="font-bold">BEAT {bIdx + 1}</span>
                    <span className="opacity-70">{(beat.durationInFrames / fps).toFixed(1)}s</span>
                  </div>
                  <div className="text-[11px] font-bold truncate mt-0.5 text-foreground">
                    {beat.primaryVisual}
                  </div>
                  <div className="text-[9px] font-mono opacity-60 truncate">
                    Cam: {beat.camera?.movement || 'push'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
