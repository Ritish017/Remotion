'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, Sparkles, RotateCcw, Undo2, Check, Loader2, ArrowRight } from 'lucide-react';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import type { VideoSpec } from '@/lib/video-spec/types';

export interface ClaudeIterationDrawerProps {
  currentSpec: VideoSpec;
  activeSceneIndex: number;
  onSpecUpdate: (newSpec: VideoSpec) => void;
}

export interface SpecHistoryEntry {
  timestamp: number;
  prompt: string;
  spec: VideoSpec;
}

export const ClaudeIterationDrawer: React.FC<ClaudeIterationDrawerProps> = ({
  currentSpec,
  activeSceneIndex,
  onSpecUpdate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<SpecHistoryEntry[]>([
    { timestamp: Date.now(), prompt: 'Initial VideoSpec', spec: currentSpec },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Claude Visual Director ready. Instruct me to adjust visual compositions, scale subjects, add documentary collage layers, change camera pacing, or enhance data stories.',
    },
  ]);

  const activeScene = currentSpec.scenes[activeSceneIndex] || currentSpec.scenes[0];

  const quickPrompts = [
    `Make Scene ${activeScene.sceneNumber} look like a Bloomberg documentary`,
    `Make the primary subject 60% larger in Scene ${activeScene.sceneNumber}`,
    `Turn Scene ${activeScene.sceneNumber} into an editorial collage`,
    `Add transcontinental dark fiber map to Scene ${activeScene.sceneNumber}`,
    `Replace with animated data story in Scene ${activeScene.sceneNumber}`,
    `Increase camera push intensity in Scene ${activeScene.sceneNumber}`,
  ];

  const handleApplyPrompt = async (promptText: string) => {
    if (!promptText.trim() || isProcessing) return;

    const userPrompt = promptText.trim();
    const lowerPrompt = userPrompt.toLowerCase();
    setPrompt('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setIsProcessing(true);

    try {
      // Determine local intelligent modifications based on user instruction
      let newVisualLanguage = activeScene.visualLanguage;
      let newTemplateId = activeScene.templateId;
      let newCamera = { ...(activeScene.camera || { type: 'push', intensity: 0.22 }) };
      let newComposition = { ...(activeScene.composition || { scale: 1.05 }) };
      let newProps = { ...(activeScene.props || {}) };

      if (lowerPrompt.includes('bloomberg') || lowerPrompt.includes('documentary')) {
        newVisualLanguage = 'editorial-paper';
        newTemplateId = 'editorial-quote';
        newCamera = { type: 'parallax', intensity: 0.24 };
      } else if (lowerPrompt.includes('collage')) {
        newVisualLanguage = 'editorial-paper';
        newTemplateId = 'editorial-quote';
      } else if (lowerPrompt.includes('larger') || lowerPrompt.includes('scale')) {
        newComposition = { ...newComposition, scale: 1.35 };
      } else if (lowerPrompt.includes('map') || lowerPrompt.includes('fiber')) {
        newVisualLanguage = 'geographic-story';
        newTemplateId = 'map-geo';
      } else if (lowerPrompt.includes('data') || lowerPrompt.includes('chart')) {
        newVisualLanguage = 'data-story';
        newTemplateId = 'chart-bar';
      } else if (lowerPrompt.includes('camera') || lowerPrompt.includes('push')) {
        newCamera = { type: 'push', intensity: 0.35 };
      }

      // 1. Call /api/remotion/spec endpoint
      const res = await fetch('/api/remotion/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_scene',
          spec: currentSpec,
          sceneNumber: activeScene.sceneNumber,
          userPrompt,
          modifications: {
            visualLanguage: newVisualLanguage,
            templateId: newTemplateId,
            camera: newCamera,
            composition: newComposition,
            props: {
              ...newProps,
              userRefinement: userPrompt,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.spec) {
        throw new Error(data.error || 'Failed to update VideoSpec with Claude');
      }

      // 2. Validate with Zod & apply repair
      const validation = validateVideoSpec(data.spec);
      const validatedSpec = validation.repairedSpec || data.spec;

      // 3. Save to history stack
      const newEntry: SpecHistoryEntry = {
        timestamp: Date.now(),
        prompt: userPrompt,
        spec: validatedSpec,
      };

      const updatedHistory = [...history.slice(0, historyIndex + 1), newEntry];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);

      // 4. Update player props immediately (instant live update)
      onSpecUpdate(validatedSpec);

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Applied visual refinement to Scene ${activeScene.sceneNumber} (${newVisualLanguage || activeScene.type}). VideoSpec validated and updated live in the Remotion Player.`,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Failed to modify spec: ${err.message}` },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      onSpecUpdate(history[prevIdx].spec);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Undid to version "${history[prevIdx].prompt}".` },
      ]);
    }
  };

  const handleRevertOriginal = () => {
    if (history.length > 0) {
      setHistoryIndex(0);
      onSpecUpdate(history[0].spec);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Reverted to original initial VideoSpec.' },
      ]);
    }
  };

  return (
    <Card className="bg-bg-surface border-border-DEFAULT rounded-2xl flex flex-col h-[480px]">
      <CardHeader className="pb-3 border-b border-border-DEFAULT flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-emerald-400" />
          <CardTitle className="text-sm font-bold text-foreground">
            VISUAL DIRECTOR ITERATION
          </CardTitle>
        </div>

        {/* History / Revert Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0 || isProcessing}
            className="h-7 px-2 text-[11px] font-mono gap-1"
          >
            <Undo2 size={12} />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevertOriginal}
            disabled={historyIndex === 0 || isProcessing}
            className="h-7 px-2 text-[11px] font-mono gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={12} />
            Revert
          </Button>
        </div>
      </CardHeader>

      {/* Quick Prompt Presets */}
      <div className="p-2.5 border-b border-border-DEFAULT bg-bg-surface2/50 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyPrompt(q)}
            disabled={isProcessing}
            className="flex-shrink-0 px-2.5 py-1 rounded-md bg-bg-surface3/80 hover:bg-bg-surface3 border border-border-DEFAULT text-[10px] font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat / Iteration History */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg, i) => (
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
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
            <Loader2 size={14} className="animate-spin text-accent-brand" />
            Claude is synthesizing scene parameters & validating Zod VideoSpec...
          </div>
        )}
      </CardContent>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyPrompt(prompt);
        }}
        className="p-3 border-t border-border-DEFAULT flex gap-2"
      >
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Instruct Claude (e.g. "Make Scene ${activeScene.sceneNumber} look like a Bloomberg documentary")`}
          className="bg-bg-surface2 border-border-DEFAULT text-xs h-9"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isProcessing || !prompt.trim()}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Update
        </Button>
      </form>
    </Card>
  );
};
