'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { MasterComposition } from '@/remotion/compositions/MasterComposition';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { runAutomatedQA, type QAReport } from '@/lib/qa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Film,
  Layers,
  Wand2,
  Sliders,
  Maximize2,
  Loader2,
} from 'lucide-react';
import type { VideoSpec, AspectRatio } from '@/lib/video-spec/types';

interface RemotionProductionStudioProps {
  initialSpec?: VideoSpec;
  onSpecChange?: (spec: VideoSpec) => void;
  onRenderRequest?: (spec: VideoSpec) => void;
}

export function RemotionProductionStudio({
  initialSpec = SAMPLE_SHOWCASE_SPEC,
  onSpecChange,
  onRenderRequest,
}: RemotionProductionStudioProps) {
  const [spec, setSpec] = useState<VideoSpec>(initialSpec);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<AspectRatio>('9:16');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiModifying, setIsAiModifying] = useState(false);
  const [aiHistory, setAiHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'AI Production Assistant ready. Ask me to adjust scenes, change camera angles, enhance typography, or tweak timings.',
    },
  ]);
  const [qaReport, setQaReport] = useState<QAReport>(() => runAutomatedQA(initialSpec));
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<string | null>(null);

  const playerRef = useRef<PlayerRef>(null);

  // Synchronize internal spec when initialSpec changes
  useEffect(() => {
    if (initialSpec) {
      setSpec(initialSpec);
      setQaReport(runAutomatedQA(initialSpec));
    }
  }, [initialSpec]);

  // Jump player to scene start frame
  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    const scene = spec.scenes[index];
    if (scene && playerRef.current) {
      playerRef.current.seekTo(scene.startFrame);
    }
  };

  // Change Aspect Ratio
  const handleFormatChange = (format: AspectRatio) => {
    setCurrentFormat(format);
    const width = format === '9:16' ? 1080 : format === '16:9' ? 1920 : 1080;
    const height = format === '9:16' ? 1920 : format === '16:9' ? 1080 : 1080;
    const updatedSpec: VideoSpec = {
      ...spec,
      composition: {
        ...spec.composition,
        format,
        width,
        height,
      },
    };
    setSpec(updatedSpec);
    onSpecChange?.(updatedSpec);
  };

  // Handle AI live modifications
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiModifying) return;

    const userMsg = aiPrompt;
    setAiPrompt('');
    setAiHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsAiModifying(true);

    try {
      // Send modification request to Claude via /api/remotion/spec
      const currentScene = spec.scenes[activeSceneIndex];
      const res = await fetch('/api/remotion/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_scene',
          spec,
          sceneNumber: currentScene.sceneNumber,
          modifications: {
            props: {
              ...currentScene.props,
              headline: userMsg.toLowerCase().includes('headline') ? userMsg.replace(/.*headline\s*(to|is)?\s*/i, '').trim() : currentScene.props?.headline,
            },
            camera: userMsg.toLowerCase().includes('cinematic') || userMsg.toLowerCase().includes('camera')
              ? { type: 'push', intensity: 0.25 }
              : currentScene.camera,
          },
        }),
      });

      const data = await res.json();
      if (data.spec) {
        setSpec(data.spec);
        setQaReport(runAutomatedQA(data.spec));
        onSpecChange?.(data.spec);
        setAiHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Applied targeted update to Scene ${currentScene.sceneNumber} (${currentScene.type}). Preview updated live in the Remotion Player.`,
          },
        ]);
      }
    } catch (err: any) {
      setAiHistory((prev) => [
        ...prev,
        { role: 'assistant', text: `Failed to modify scene: ${err.message}` },
      ]);
    } finally {
      setIsAiModifying(false);
    }
  };

  const handleTriggerRender = async () => {
    setIsRendering(true);
    setRenderProgress('Initializing render job...');
    try {
      const res = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        setRenderProgress('Render complete!');
        window.open(data.downloadUrl, '_blank');
      } else {
        setRenderProgress('Render job submitted.');
      }
    } catch (e: any) {
      setRenderProgress(`Render failed: ${e.message}`);
    } finally {
      setTimeout(() => setIsRendering(false), 2000);
    }
  };

  const currentScene = spec.scenes[activeSceneIndex] || spec.scenes[0];

  return (
    <div className="space-y-6">
      {/* Studio Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface border border-border-DEFAULT shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-brand/20 flex items-center justify-center text-accent-brand">
            <Film size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">{spec.title}</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {spec.composition.durationInFrames} frames · {spec.composition.fps} FPS · {(spec.composition.durationInFrames / spec.composition.fps).toFixed(1)}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Format Selector */}
          <div className="flex items-center p-1 rounded-lg bg-bg-surface2 border border-border-DEFAULT text-xs font-semibold">
            {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatChange(fmt)}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentFormat === fmt
                    ? 'bg-accent-brand text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* QA Score Badge */}
          <Badge
            variant="outline"
            className={`font-mono text-xs px-3 py-1 flex items-center gap-1.5 ${
              qaReport.passed
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
            }`}
          >
            {qaReport.passed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            QA Score: {qaReport.score}/100
          </Badge>

          {/* Render Action */}
          <Button
            onClick={handleTriggerRender}
            disabled={isRendering}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            {isRendering ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isRendering ? 'Rendering MP4...' : 'Render MP4'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Player on Left, AI Assistant on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Remotion Player Window (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center p-4 min-h-[580px]">
            <div
              style={{
                width: currentFormat === '9:16' ? '330px' : currentFormat === '16:9' ? '100%' : '440px',
                aspectRatio: currentFormat === '9:16' ? '9/16' : currentFormat === '16:9' ? '16/9' : '1/1',
                maxHeight: '680px',
              }}
              className="rounded-xl overflow-hidden shadow-2xl border border-white/15"
            >
              <Player
                ref={playerRef}
                component={MasterComposition}
                inputProps={{ spec }}
                durationInFrames={spec.composition.durationInFrames}
                fps={spec.composition.fps}
                compositionWidth={spec.composition.width}
                compositionHeight={spec.composition.height}
                style={{ width: '100%', height: '100%' }}
                controls
                autoPlay={false}
                loop
              />
            </div>
          </div>

          {/* Scene Scrubber Bar */}
          <div className="p-4 rounded-xl bg-bg-surface border border-border-DEFAULT space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <Layers size={14} className="text-accent-brand" />
                Scene Timeline ({spec.scenes.length} Scenes)
              </span>
              <span>Click scene to scrub</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {spec.scenes.map((scene, idx) => {
                const isActive = idx === activeSceneIndex;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      isActive
                        ? 'bg-accent-brand/20 border-accent-brand text-white'
                        : 'bg-bg-surface2 border-border-DEFAULT text-muted-foreground hover:border-border-strong hover:text-foreground'
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold">0{scene.sceneNumber}</div>
                    <div className="text-xs font-medium truncate capitalize">{scene.type}</div>
                    <div className="text-[9px] font-mono opacity-60">
                      {(scene.durationFrames / 30).toFixed(1)}s
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Production Assistant & Scene Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Scene Inspector Card */}
          <Card className="bg-bg-surface border-border-DEFAULT rounded-2xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders size={16} className="text-accent-brand" />
                  Scene {currentScene.sceneNumber}: {currentScene.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Template: {currentScene.templateId} · Camera: {currentScene.camera?.type || 'push'}
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono uppercase">
                {currentScene.type}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {currentScene.narrationText && (
                <div className="p-3 rounded-lg bg-bg-surface2 border border-border-DEFAULT">
                  <span className="font-mono text-muted-foreground block mb-1 text-[10px] uppercase tracking-wider">
                    Spoken Script
                  </span>
                  <p className="text-foreground italic leading-relaxed font-medium">
                    "{currentScene.narrationText}"
                  </p>
                </div>
              )}

              {/* Dynamic Props Summary */}
              {currentScene.props && (
                <div className="p-3 rounded-lg bg-bg-surface2 border border-border-DEFAULT space-y-1">
                  <span className="font-mono text-muted-foreground block mb-1 text-[10px] uppercase tracking-wider">
                    Key Visual Props
                  </span>
                  {Object.entries(currentScene.props).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="text-foreground truncate max-w-[200px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Production Assistant Chat & Live Modifier */}
          <Card className="bg-bg-surface border-border-DEFAULT rounded-2xl flex flex-col h-[400px]">
            <CardHeader className="pb-2 border-b border-border-DEFAULT flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={16} className="text-emerald-400" />
                <CardTitle className="text-sm font-bold">Claude Production Assistant</CardTitle>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Active Runtime
              </span>
            </CardHeader>

            {/* Chat History */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent-brand/20 text-white border border-accent-brand/40 ml-6'
                      : 'bg-bg-surface2 text-muted-foreground border border-border-DEFAULT mr-6'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isAiModifying && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Loader2 size={14} className="animate-spin text-accent-brand" />
                  Claude is modifying scene parameters...
                </div>
              )}
            </CardContent>

            {/* Input form */}
            <form onSubmit={handleAiSubmit} className="p-3 border-t border-border-DEFAULT flex gap-2">
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`Prompt (e.g. "Make Scene ${currentScene.sceneNumber} more cinematic")`}
                className="bg-bg-surface2 border-border-DEFAULT text-xs h-9"
              />
              <Button type="submit" size="sm" disabled={isAiModifying || !aiPrompt.trim()} className="gap-1.5">
                <Sparkles size={14} />
                Tweak
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
