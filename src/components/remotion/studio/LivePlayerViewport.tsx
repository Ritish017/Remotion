'use client';

import React, { useEffect, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { MasterComposition } from '@/remotion/compositions/MasterComposition';
import { PLATFORM_PRESETS } from '@/lib/video-spec/presets';
import type { VideoSpec, AspectRatio } from '@/lib/video-spec/types';

export interface LivePlayerViewportProps {
  playerRef: React.RefObject<PlayerRef | null>;
  spec: VideoSpec;
  format: AspectRatio;
  zoom: number | 'fit';
  showSafeZone: boolean;
  playbackRate: number;
  isMuted: boolean;
  volume: number;
  onFrameUpdate?: (frame: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const LivePlayerViewport: React.FC<LivePlayerViewportProps> = ({
  playerRef,
  spec,
  format,
  zoom,
  showSafeZone,
  playbackRate,
  isMuted,
  volume,
  onFrameUpdate,
  onPlayStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize volume and mute state
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unmute();
          playerRef.current.setVolume(volume);
        }
      } catch {}
    }
  }, [isMuted, volume, playerRef]);

  // Attach event listeners to player for frame & state updates
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleFrameUpdate = (e: { detail: { frame: number } }) => {
      onFrameUpdate?.(e.detail.frame);
    };

    const handlePlay = () => onPlayStateChange?.(true);
    const handlePause = () => onPlayStateChange?.(false);

    player.addEventListener('frameupdate', handleFrameUpdate);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);

    return () => {
      player.removeEventListener('frameupdate', handleFrameUpdate);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
    };
  }, [playerRef, onFrameUpdate, onPlayStateChange]);

  // Calculate dimensions based on format
  const getContainerDimensions = () => {
    switch (format) {
      case '9:16':
        return { width: '320px', aspectRatio: '9/16', maxHeight: '570px' };
      case '16:9':
        return { width: '100%', maxWidth: '760px', aspectRatio: '16/9', maxHeight: '430px' };
      case '1:1':
        return { width: '420px', aspectRatio: '1/1', maxHeight: '420px' };
      default:
        return { width: '320px', aspectRatio: '9/16', maxHeight: '570px' };
    }
  };

  const dim = getContainerDimensions();
  const zoomScale = zoom === 'fit' ? 1.0 : zoom;

  // Resolve platform safe zone info
  const preset = format === '9:16' ? PLATFORM_PRESETS.YouTubeShorts : PLATFORM_PRESETS.YouTubeLandscape;
  const safeZone = preset?.safeZone || { topPaddingPct: 8, bottomPaddingPct: 15, horizontalPaddingPct: 6 };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[480px] max-h-[640px] bg-[#07080a] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden p-6 shadow-2xl select-none"
    >
      {/* Subtle Studio Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Centered Scaled Player Frame */}
      <div
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          width: dim.width,
          aspectRatio: dim.aspectRatio,
          maxHeight: dim.maxHeight,
        }}
        className="relative rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black flex-shrink-0"
      >
        <Player
          ref={playerRef}
          component={MasterComposition}
          inputProps={{ spec }}
          durationInFrames={spec.composition.durationInFrames}
          fps={spec.composition.fps}
          playbackRate={playbackRate}
          compositionWidth={spec.composition.width}
          compositionHeight={spec.composition.height}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          autoPlay={false}
          loop
          acknowledgeRemotionLicense={true}
        />

        {/* Safe Zone Overlay */}
        {showSafeZone && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {/* Title Safe Boundary */}
            <div
              className="absolute border border-dashed border-cyan-400/60 rounded-md"
              style={{
                top: `${safeZone.topPaddingPct}%`,
                bottom: `${safeZone.bottomPaddingPct}%`,
                left: `${safeZone.horizontalPaddingPct}%`,
                right: `${safeZone.horizontalPaddingPct}%`,
              }}
            >
              <span className="absolute top-1 left-1.5 font-mono text-[9px] text-cyan-300 font-bold bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-400/30">
                TITLE SAFE (90%)
              </span>
            </div>

            {/* Social UI Exclusion Zones (for 9:16 Shorts/Reels/TikTok) */}
            {format === '9:16' && (
              <>
                {/* Right-side Action Buttons (Like, Share, Sound) */}
                <div className="absolute right-2 bottom-24 w-12 h-44 border border-red-500/40 bg-red-500/10 rounded-lg flex flex-col items-center justify-around text-[8px] font-mono text-red-300">
                  <div className="w-5 h-5 rounded-full border border-red-400/40 flex items-center justify-center">♥</div>
                  <div className="w-5 h-5 rounded-full border border-red-400/40 flex items-center justify-center">💬</div>
                  <div className="w-5 h-5 rounded-full border border-red-400/40 flex items-center justify-center">↗</div>
                  <span>UI ZONE</span>
                </div>

                {/* Bottom Title & Handle Zone */}
                <div className="absolute left-3 right-16 bottom-3 h-16 border border-amber-500/40 bg-amber-500/10 rounded-lg p-1.5 flex flex-col justify-end text-[8px] font-mono text-amber-300">
                  <span className="font-bold">@channel_handle</span>
                  <span className="truncate opacity-75">Caption & audio metadata zone</span>
                </div>
              </>
            )}

            {/* Center Grid Reference Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-full h-[1px] bg-white/40" />
              <div className="h-full w-[1px] bg-white/40 absolute" />
              <div className="w-4 h-4 rounded-full border border-white/60 absolute" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
