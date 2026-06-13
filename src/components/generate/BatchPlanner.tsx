'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Layers } from 'lucide-react'
import { MODELS } from '@/lib/constants'

interface BatchPlannerProps {
  onQueueBatch: (topics: string[], days: number) => Promise<void>
}

export function BatchPlanner({ onQueueBatch }: BatchPlannerProps) {
  const [days, setDays] = useState(30)
  const [topicsText, setTopicsText] = useState('')
  const [isQueueing, setIsQueueing] = useState(false)

  const topicsList = topicsText.split('\n').filter(t => t.trim().length > 0)
  const numVideos = topicsList.length || days // default to 1 per day if empty just for est
  const weeks = (days / 7).toFixed(1)
  
  // Use Sonnet for estimation
  const estCost = numVideos * MODELS[1].perVideo

  const handleQueue = async () => {
    if (topicsList.length === 0) return
    setIsQueueing(true)
    await onQueueBatch(topicsList, days)
    setIsQueueing(false)
    setTopicsText('')
  }

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden mt-6">
      <CardHeader className="pb-4 border-b border-border-DEFAULT/50">
        <CardTitle className="text-base font-bold flex items-center justify-between">
          30-Day Batch Planner
          <Badge variant="outline" className="font-mono bg-bg-surface2 text-muted-foreground border-border-strong text-[10px]">
            {numVideos} videos · {weeks} weeks · Est. ${estCost.toFixed(3)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Timespan: {days} Days</label>
          </div>
          <input 
            type="range" 
            min="7" 
            max="30" 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-1.5 bg-bg-surface3 rounded-lg appearance-none cursor-pointer accent-accent-brand"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Topics Pipeline</label>
          <Textarea 
            placeholder="Paste topics (one per line)&#10;e.g. AI tools for productivity&#10;How to use Next.js 14..." 
            className="bg-bg-surface2 border-border-strong font-mono text-sm resize-y"
            rows={6}
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="bg-bg-surface2 border-t border-border-DEFAULT p-4">
        <Button 
          className="w-full font-mono text-xs text-white hover:opacity-90 shadow-none border-none bg-accent-brand h-9"
          disabled={topicsList.length === 0 || isQueueing}
          onClick={handleQueue}
        >
          {isQueueing ? (
            <span className="flex items-center"><Layers size={14} className="mr-2 animate-bounce" /> Queueing...</span>
          ) : (
            <span className="flex items-center"><Layers size={14} className="mr-2" /> Queue Pipeline →</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
