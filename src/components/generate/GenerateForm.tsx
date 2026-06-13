'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MODELS, VERTICALS, PLATFORMS } from '@/lib/constants'
import { Loader2, Wand2 } from 'lucide-react'

interface GenerateFormProps {
  onGenerate: (data: any) => Promise<void>
  isGenerating: boolean
}

export function GenerateForm({ onGenerate, isGenerating }: GenerateFormProps) {
  const [prompt, setPrompt] = useState('')
  const [vertical, setVertical] = useState('social')
  const [platform, setPlatform] = useState('reels')
  const [model, setModel] = useState('claude-sonnet-4-6')
  const [duration, setDuration] = useState('60')

  const selectedModel = MODELS.find(m => m.id === model) || MODELS[1]
  const selectedVertical = VERTICALS.find(v => v.id === vertical)
  
  const handleGenerate = () => {
    if (!prompt.trim()) return
    onGenerate({ prompt, vertical, platform, model, duration })
  }

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <div className="h-[2px] w-full" style={{ backgroundColor: selectedVertical?.accent || '#6c47ff' }} />
      <CardHeader className="pb-4 border-b border-border-DEFAULT/50">
        <CardTitle className="text-base font-bold">Quick Generate</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Video Brief</label>
          <Textarea 
            placeholder="Describe your video idea or topic…" 
            className="bg-bg-surface2 border-border-strong resize-none"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Vertical</label>
            <Select value={vertical} onValueChange={(val) => setVertical(val as string)}>
              <SelectTrigger className="bg-bg-surface2 border-border-strong text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERTICALS.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Platform</label>
            <Select value={platform} onValueChange={(val) => setPlatform(val as string)}>
              <SelectTrigger className="bg-bg-surface2 border-border-strong text-sm capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">AI Model</label>
            <Select value={model} onValueChange={(val) => setModel(val as string)}>
              <SelectTrigger className="bg-bg-surface2 border-border-strong font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id} className="font-mono text-xs">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Duration</label>
            <Select value={duration} onValueChange={(val) => setDuration(val as string)}>
              <SelectTrigger className="bg-bg-surface2 border-border-strong font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30" className="font-mono text-xs">30 seconds</SelectItem>
                <SelectItem value="60" className="font-mono text-xs">60 seconds</SelectItem>
                <SelectItem value="120" className="font-mono text-xs">120 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-bg-surface2 border-t border-border-DEFAULT p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Est. Cost:</span>
          <Badge variant="outline" className="font-mono bg-transparent border-border-strong text-foreground h-6 px-2">
            ${selectedModel.perVideo.toFixed(5)}
          </Badge>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={!prompt.trim() || isGenerating}
          className="font-mono text-xs h-9 text-white hover:opacity-90 shadow-none"
          style={{ backgroundColor: selectedVertical?.accent || '#6c47ff' }}
        >
          {isGenerating ? (
            <><Loader2 size={14} className="mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Wand2 size={14} className="mr-2" /> Generate Narrative →</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
