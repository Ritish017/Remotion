'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sliders, Camera, FileText, Sparkles, Move } from 'lucide-react';
import type { SceneData } from '@/lib/video-spec/types';

export interface CurrentSceneInspectorProps {
  scene: SceneData;
  fps?: number;
}

export const CurrentSceneInspector: React.FC<CurrentSceneInspectorProps> = ({
  scene,
  fps = 30,
}) => {
  if (!scene) return null;

  const durationSec = (scene.durationFrames / fps).toFixed(1);

  return (
    <Card className="bg-bg-surface border-border-DEFAULT rounded-2xl">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-accent-brand bg-accent-brand/10 px-2 py-0.5 rounded border border-accent-brand/30">
              SCENE 0{scene.sceneNumber}
            </span>
            <CardTitle className="text-base font-bold text-foreground">
              {scene.title || 'Untitled Scene'}
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Template: <span className="text-foreground font-semibold">{scene.templateId}</span> · {durationSec}s ({scene.durationFrames} frames)
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono uppercase bg-bg-surface2">
          {scene.type}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        {/* Camera Motion Specification */}
        <div className="p-3 rounded-xl bg-bg-surface2 border border-border-DEFAULT flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={14} className="text-cyan-400" />
            <span className="font-mono text-[11px] text-muted-foreground">Camera Movement:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-cyan-300">
            <span className="capitalize">{scene.camera?.type || 'push'}</span>
            <span className="text-zinc-500">·</span>
            <span>Intensity: {scene.camera?.intensity ?? 0.2}</span>
          </div>
        </div>

        {/* Spoken Narration Script */}
        {scene.narrationText && (
          <div className="p-3 rounded-xl bg-bg-surface2 border border-border-DEFAULT space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-muted-foreground text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={11} className="text-amber-400" />
                Spoken Script
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {scene.narrationText.split(' ').length} words
              </span>
            </div>
            <p className="text-foreground italic leading-relaxed font-medium">
              "{scene.narrationText}"
            </p>
          </div>
        )}

        {/* Dynamic Scene Props Summary */}
        {scene.props && Object.keys(scene.props).length > 0 && (
          <div className="p-3 rounded-xl bg-bg-surface2 border border-border-DEFAULT space-y-1.5">
            <span className="font-mono text-muted-foreground block text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={11} className="text-accent-brand" />
              Dynamic Visual Props
            </span>
            <div className="space-y-1 pt-1">
              {Object.entries(scene.props).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center font-mono text-[11px]">
                  <span className="text-muted-foreground truncate max-w-[120px]">{key}:</span>
                  <span className="text-foreground truncate max-w-[180px] font-semibold">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
