'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Video, Film, Wand2 } from 'lucide-react';
import type { VideoSpec, AspectRatio } from '@/lib/video-spec/types';
import { validateVideoSpec } from '@/lib/video-spec/validator';

export interface NewVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVideoGenerated: (spec: VideoSpec) => void;
}

export const NewVideoModal: React.FC<NewVideoModalProps> = ({
  open,
  onOpenChange,
  onVideoGenerated,
}) => {
  const [topic, setTopic] = useState("The race to build the world's most advanced humanoid robot");
  const [durationSec, setDurationSec] = useState('45');
  const [format, setFormat] = useState<AspectRatio>('9:16');
  const [style, setStyle] = useState('Editorial Documentary');
  const [channel, setChannel] = useState('Catalyst Tech');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_video_spec',
          topic,
          durationSeconds: parseInt(durationSec, 10) || 45,
          vertical: 'catalyst-editorial',
          brandVoice: style,
          targetAudience: channel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.spec) {
        throw new Error(data.error || 'Failed to generate VideoSpec with Claude');
      }

      // Validate & repair
      const validation = validateVideoSpec(data.spec);
      const validatedSpec = validation.repairedSpec || data.spec;

      // Ensure composition format matches selected format
      const width = format === '9:16' ? 1080 : format === '16:9' ? 1920 : 1080;
      const height = format === '9:16' ? 1920 : format === '16:9' ? 1080 : 1080;
      validatedSpec.composition = {
        ...validatedSpec.composition,
        format,
        width,
        height,
      };

      onVideoGenerated(validatedSpec);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border-border-DEFAULT text-foreground sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent-brand">
            <Wand2 size={20} />
            <DialogTitle className="text-lg font-bold">Generate New Video with Claude</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Claude AI Director orchestrates scriptwriting, visual beats, scene timing, and Zod VideoSpec assembly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Video Topic & Narrative Hook</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The race to build the world's most advanced humanoid robot"
              className="bg-bg-surface2 border-border-DEFAULT text-xs min-h-[80px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Duration</Label>
              <select
                value={durationSec}
                onChange={(e) => setDurationSec(e.target.value)}
                className="w-full h-9 bg-bg-surface2 border border-border-DEFAULT rounded-md text-xs px-3 text-foreground"
              >
                <option value="15">15 Seconds (Quick Hook)</option>
                <option value="30">30 Seconds (Social Brief)</option>
                <option value="45">45 Seconds (Deep Dive)</option>
                <option value="60">60 Seconds (Full Feature)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Aspect Ratio</Label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as AspectRatio)}
                className="w-full h-9 bg-bg-surface2 border border-border-DEFAULT rounded-md text-xs px-3 text-foreground"
              >
                <option value="9:16">9:16 (Shorts / Reels / TikTok)</option>
                <option value="16:9">16:9 (YouTube Landscape)</option>
                <option value="1:1">1:1 (Square Feed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Editorial Style</Label>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-bg-surface2 border-border-DEFAULT text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Channel / Brand</Label>
              <Input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-bg-surface2 border-border-DEFAULT text-xs h-9"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="gap-2 bg-accent-brand hover:bg-accent-brand/90 text-white font-bold text-xs h-9"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGenerating ? 'Synthesizing VideoSpec...' : 'Generate Video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
