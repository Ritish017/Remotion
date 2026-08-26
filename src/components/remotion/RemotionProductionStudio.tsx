'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayerRef } from '@remotion/player';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { runAutomatedQA, type QAReport } from '@/lib/qa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Sliders,
  Maximize2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Plus,
  ShieldAlert,
  HelpCircle,
  Eye,
} from 'lucide-react';
import type { VideoSpec, AspectRatio } from '@/lib/video-spec/types';

import { LivePlayerViewport } from './studio/LivePlayerViewport';
import { ProportionalTimeline } from './studio/ProportionalTimeline';
import { CurrentSceneInspector } from './studio/CurrentSceneInspector';
import { ClaudeIterationDrawer } from './studio/ClaudeIterationDrawer';
import { VisualQAPanel } from './studio/VisualQAPanel';
import { CaptionsInspector } from './studio/CaptionsInspector';
import { AudioInspector } from './studio/AudioInspector';
import { FinalRenderComparison } from './studio/FinalRenderComparison';
import { NewVideoModal } from './studio/NewVideoModal';

interface RemotionProductionStudioProps {
  initialSpec?: VideoSpec;
  episodeTitle?: string;
  onSpecChange?: (spec: VideoSpec) => void;
  onRenderRequest?: (spec: VideoSpec) => void;
}

export function RemotionProductionStudio({
  initialSpec = SAMPLE_SHOWCASE_SPEC,
  episodeTitle,
  onSpecChange,
  onRenderRequest,
}: RemotionProductionStudioProps) {
  const [spec, setSpec] = useState<VideoSpec>(initialSpec);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<AspectRatio>(initialSpec?.composition?.format || '9:16');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [zoomLevel, setZoomLevel] = useState<number | 'fit'>('fit');
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [activeTab, setActiveTab] = useState<'qa' | 'captions' | 'audio' | 'render'>('qa');

  // QA and Rendering state
  const [qaReport, setQaReport] = useState<QAReport>(() => runAutomatedQA(initialSpec));
  const [isRendering, setIsRendering] = useState(false);
  const [renderStage, setRenderStage] = useState<string | null>(null);
  const [renderProgressPct, setRenderProgressPct] = useState(0);
  const [completedJob, setCompletedJob] = useState<{ jobId: string; publicUrl: string } | null>(null);
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);

  // Human Approval gate checklist
  const [humanApproved, setHumanApproved] = useState(false);

  const playerRef = useRef<PlayerRef>(null);

  const totalFrames = spec.composition.durationInFrames || 1350;
  const fps = spec.composition.fps || 30;

  // Format timecode MM:SS.ms
  const formatTimecode = (frames: number) => {
    const totalSec = frames / fps;
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Synchronize internal spec when initialSpec changes
  useEffect(() => {
    if (initialSpec) {
      setSpec(initialSpec);
      setQaReport(runAutomatedQA(initialSpec));
      if (initialSpec.composition?.format) {
        setCurrentFormat(initialSpec.composition.format);
      }
    }
  }, [initialSpec]);

  // Synchronize active scene based on current frame
  const handleFrameUpdate = useCallback(
    (frame: number) => {
      setCurrentFrame(frame);
      const sceneIdx = spec.scenes.findIndex(
        (s) => frame >= s.startFrame && frame < s.startFrame + s.durationFrames
      );
      if (sceneIdx !== -1 && sceneIdx !== activeSceneIndex) {
        setActiveSceneIndex(sceneIdx);
      }
    },
    [spec.scenes, activeSceneIndex]
  );

  // Jump player to scene start frame
  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    const targetScene = spec.scenes[index];
    if (targetScene && playerRef.current) {
      playerRef.current.seekTo(targetScene.startFrame);
    }
  };

  // Seek to arbitrary frame
  const handleSeekToFrame = (frame: number) => {
    const clamped = Math.max(0, Math.min(totalFrames - 1, frame));
    if (playerRef.current) {
      playerRef.current.seekTo(clamped);
    }
  };

  // Step frame forward / backward
  const handleStepFrame = (delta: number) => {
    handleSeekToFrame(currentFrame + delta);
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
    setQaReport(runAutomatedQA(updatedSpec));
    onSpecChange?.(updatedSpec);
  };

  // Handle Spec update from Claude
  const handleSpecUpdateFromClaude = (updatedSpec: VideoSpec) => {
    setSpec(updatedSpec);
    setQaReport(runAutomatedQA(updatedSpec));
    onSpecChange?.(updatedSpec);
  };

  // Play / Pause Toggle
  const togglePlayPause = () => {
    if (playerRef.current) {
      playerRef.current.toggle();
    }
  };

  // Keyboard Shortcuts (Space, Left/Right arrow, Home, End)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(e.shiftKey ? -5 : -1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(e.shiftKey ? 5 : 1);
      } else if (e.code === 'Home') {
        e.preventDefault();
        handleSeekToFrame(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        handleSeekToFrame(totalFrames - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFrame, totalFrames]);

  // Handle Final Local Render Dispatch
  const handleTriggerRender = async () => {
    setIsRendering(true);
    setRenderStage('Preparing Remotion bundle...');
    setRenderProgressPct(5);
    setCompletedJob(null);

    try {
      const res = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });
      const data = await res.json();

      if (!res.ok || data.status === 'FAILED') {
        throw new Error(data.error || 'Failed to initiate local render job');
      }

      const jobId = data.jobId;

      if (data.status === 'COMPLETED' && data.publicUrl) {
        setRenderStage('Render verified & complete! 🎉');
        setRenderProgressPct(100);
        setIsRendering(false);
        setCompletedJob({ jobId, publicUrl: data.publicUrl });
        setActiveTab('render');
        return;
      }

      // Poll real render status from /api/remotion/render/status/[jobId]
      setRenderStage('Rendering frames locally (H.264)...');
      let attempts = 0;
      const maxAttempts = 120; // Up to 4 minutes with 2s intervals

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch(`/api/remotion/render/status/${jobId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setIsRendering(false);
            setRenderStage('Local Render verified & complete! 🎉');
            setRenderProgressPct(100);
            if (statusData.publicUrl) {
              setCompletedJob({ jobId, publicUrl: statusData.publicUrl });
              setActiveTab('render');
            }
          } else if (statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            setIsRendering(false);
            setRenderStage(`Local render failed: ${statusData.error || 'Unknown error'}`);
          } else {
            const pct = Math.min(98, Math.max(5, Math.round((statusData.progress || 0) * 100)));
            setRenderProgressPct(pct);
            setRenderStage(`Rendering frames (${pct}%)...`);
          }
        } catch (pollErr: any) {
          console.warn('Status poll error:', pollErr.message);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsRendering(false);
          setRenderStage('Local render timed out. Check SQLite render_jobs table.');
        }
      }, 2000);
    } catch (e: any) {
      setIsRendering(false);
      setRenderStage(`Local render failed: ${e.message}`);
    }
  };

  const currentScene = spec.scenes[activeSceneIndex] || spec.scenes[0];

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-bg-surface border border-border-DEFAULT shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-brand/20 flex items-center justify-center text-accent-brand">
            <Film size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {episodeTitle || spec.title}
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                LOCAL ENGINE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {spec.composition.width}×{spec.composition.height} · {fps} FPS · {(totalFrames / fps).toFixed(1)}s Duration
            </p>
          </div>
        </div>

        {/* Right Controls: Aspect Ratio, Safe Zones, Zoom, New Video */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Format Selector */}
          <div className="flex items-center p-1 rounded-lg bg-bg-surface2 border border-border-DEFAULT text-xs font-semibold">
            {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleFormatChange(fmt)}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentFormat === fmt
                    ? 'bg-accent-brand text-white shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Safe Zone Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`h-8 text-xs font-mono gap-1.5 ${
              showSafeZones
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert size={13} />
            Safe Zones
          </Button>

          {/* Zoom Selector */}
          <div className="flex items-center gap-1 bg-bg-surface2 border border-border-DEFAULT rounded-lg p-1 text-[11px] font-mono">
            <span className="text-muted-foreground px-1.5 flex items-center gap-1">
              <Eye size={12} />
              Zoom:
            </span>
            {(['fit', 0.75, 1.0, 1.25] as const).map((z) => (
              <button
                key={String(z)}
                onClick={() => setZoomLevel(z)}
                className={`px-2 py-0.5 rounded ${
                  zoomLevel === z
                    ? 'bg-accent-brand text-white font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {z === 'fit' ? 'Fit' : `${Math.round(z * 100)}%`}
              </button>
            ))}
          </div>

          {/* QA Score Badge */}
          <Badge
            variant="outline"
            className={`font-mono text-xs px-2.5 py-1 flex items-center gap-1.5 ${
              qaReport.passed
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
            }`}
          >
            {qaReport.passed ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
            QA: {qaReport.score}/100
          </Badge>

          {/* New Video Button */}
          <Button
            size="sm"
            onClick={() => setIsNewVideoModalOpen(true)}
            className="gap-1.5 bg-bg-surface2 hover:bg-bg-surface3 border border-border-DEFAULT text-foreground font-bold h-8 text-xs"
          >
            <Plus size={14} />
            New Video
          </Button>
        </div>
      </div>

      {/* Main Production Workspace: Left 7 Cols (Player & Scrubber), Right 5 Cols (Inspectors) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Viewport & Timeline Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Video Player */}
          <LivePlayerViewport
            playerRef={playerRef}
            spec={spec}
            format={currentFormat}
            zoom={zoomLevel}
            showSafeZone={showSafeZones}
            playbackRate={playbackRate}
            isMuted={isMuted}
            volume={volume}
            onFrameUpdate={handleFrameUpdate}
            onPlayStateChange={setIsPlaying}
          />

          {/* Frame-Accurate Scrubber & Transport Controls */}
          <div className="p-4 rounded-2xl bg-bg-surface border border-border-DEFAULT space-y-3 shadow-md select-none">
            {/* Draggable Progress Range Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={totalFrames - 1}
                value={currentFrame}
                onChange={(e) => handleSeekToFrame(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-bg-surface3 rounded-lg appearance-none cursor-pointer accent-accent-brand focus:outline-none"
              />
            </div>

            {/* Transport & Readouts Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Playback Transport Buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSeekToFrame(0)}
                  className="h-8 w-8 p-0"
                  title="Restart (Home)"
                >
                  <RotateCcw size={14} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStepFrame(-1)}
                  className="h-8 w-8 p-0"
                  title="Previous Frame (Left Arrow)"
                >
                  <ChevronLeft size={16} />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  size="sm"
                  className="h-8 px-3 bg-accent-brand hover:bg-accent-brand/90 text-white font-bold gap-1.5"
                  title="Play / Pause (Space)"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStepFrame(1)}
                  className="h-8 w-8 p-0"
                  title="Next Frame (Right Arrow)"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>

              {/* Exact Frame & Time Readouts */}
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="px-2.5 py-1 rounded-md bg-bg-surface2 border border-border-DEFAULT text-foreground font-bold">
                  {formatTimecode(currentFrame)} / {formatTimecode(totalFrames)}
                </div>
                <div className="text-muted-foreground">
                  Frame <span className="text-foreground font-semibold">{currentFrame}</span> / {totalFrames}
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                  {fps} FPS
                </Badge>
              </div>

              {/* Playback Speeds & Audio Volume */}
              <div className="flex items-center gap-2">
                {/* Speed selector */}
                <div className="flex items-center bg-bg-surface2 border border-border-DEFAULT rounded-lg p-0.5 text-[11px] font-mono">
                  {([0.25, 0.5, 1, 1.5, 2] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={`px-1.5 py-0.5 rounded transition-all ${
                        playbackRate === rate
                          ? 'bg-accent-brand text-white font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Mute Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`h-8 w-8 p-0 ${isMuted ? 'text-red-400 border-red-500/30' : 'text-muted-foreground'}`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </Button>
              </div>
            </div>
          </div>

          {/* Proportional Scene Timeline */}
          <ProportionalTimeline
            spec={spec}
            currentFrame={currentFrame}
            activeSceneIndex={activeSceneIndex}
            onSelectScene={handleSelectScene}
            onSeekToFrame={handleSeekToFrame}
          />
        </div>

        {/* Right Column: Scene Inspector, Claude AI Modifier & Inspection Tabs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Current Scene Inspector */}
          <CurrentSceneInspector scene={currentScene} fps={fps} />

          {/* Real-time Claude Iteration Assistant */}
          <ClaudeIterationDrawer
            currentSpec={spec}
            activeSceneIndex={activeSceneIndex}
            onSpecUpdate={handleSpecUpdateFromClaude}
          />
        </div>
      </div>

      {/* Bottom Inspection & Production Render Station */}
      <div className="p-5 rounded-2xl bg-bg-surface border border-border-DEFAULT shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-DEFAULT pb-3">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-auto"
          >
            <TabsList className="bg-bg-surface2 border border-border-DEFAULT">
              <TabsTrigger value="qa" className="text-xs font-semibold gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Visual QA ({qaReport.score}/100)
              </TabsTrigger>
              <TabsTrigger value="captions" className="text-xs font-semibold gap-1.5">
                <Layers size={13} className="text-amber-400" />
                Captions
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs font-semibold gap-1.5">
                <Volume2 size={13} className="text-cyan-400" />
                Audio & Ducking
              </TabsTrigger>
              {completedJob && (
                <TabsTrigger value="render" className="text-xs font-semibold gap-1.5 text-emerald-400">
                  <Film size={13} />
                  Final MP4
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Render Checklist & Approval Gate */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium select-none">
              <input
                type="checkbox"
                checked={humanApproved}
                onChange={(e) => setHumanApproved(e.target.checked)}
                className="w-4 h-4 rounded border-border-DEFAULT text-emerald-600 focus:ring-emerald-500 bg-bg-surface2"
              />
              <span className={humanApproved ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}>
                Human Visual Inspection Approved
              </span>
            </label>

            <Button
              onClick={handleTriggerRender}
              disabled={isRendering || !humanApproved}
              className={`gap-2 font-bold text-xs h-9 px-4 ${
                humanApproved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                  : 'bg-bg-surface3 text-muted-foreground opacity-60 cursor-not-allowed'
              }`}
            >
              {isRendering ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isRendering ? 'Rendering MP4...' : 'RENDER FINAL VIDEO'}
            </Button>
          </div>
        </div>

        {/* Active Render Progress Bar if Rendering */}
        {isRendering && (
          <div className="p-4 rounded-xl bg-bg-surface2 border border-border-DEFAULT space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold text-foreground">
              <span className="flex items-center gap-2 text-emerald-400">
                <Loader2 size={14} className="animate-spin" />
                {renderStage}
              </span>
              <span>{renderProgressPct}%</span>
            </div>
            <div className="w-full h-2 bg-bg-surface3 rounded-full overflow-hidden">
              <div
                style={{ width: `${renderProgressPct}%` }}
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        )}

        {/* Tab Panels */}
        <div>
          {activeTab === 'qa' && <VisualQAPanel qaReport={qaReport} />}
          {activeTab === 'captions' && (
            <CaptionsInspector
              words={spec.narration?.words}
              currentFrame={currentFrame}
              fps={fps}
              brand={spec.brand}
              onSeekToTimestamp={(sec) => handleSeekToFrame(Math.round(sec * fps))}
            />
          )}
          {activeTab === 'audio' && (
            <AudioInspector
              audio={spec.audio}
              narration={spec.narration}
              currentFrame={currentFrame}
              fps={fps}
            />
          )}
          {activeTab === 'render' && completedJob && (
            <FinalRenderComparison
              jobId={completedJob.jobId}
              publicUrl={completedJob.publicUrl}
              spec={spec}
            />
          )}
        </div>
      </div>

      {/* New Video Modal */}
      <NewVideoModal
        open={isNewVideoModalOpen}
        onOpenChange={setIsNewVideoModalOpen}
        onVideoGenerated={handleSpecUpdateFromClaude}
      />
    </div>
  );
}
