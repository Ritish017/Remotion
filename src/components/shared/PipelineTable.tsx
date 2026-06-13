'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELS } from '@/lib/constants'

export interface PipelineItemData {
  topic: string
  day: string
  status: number
  model: string
  cost: string
}

interface PipelineTableProps {
  items: PipelineItemData[]
  accent: string
  label: string
}

export function PipelineTable({ items: initialItems, accent, label }: PipelineTableProps) {
  const [items, setItems] = useState(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])


  const handleModelChange = (index: number, newModelId: string) => {
    const newItems = [...items]
    const modelData = MODELS.find(m => m.id === newModelId)
    if (modelData) {
      newItems[index] = {
        ...newItems[index],
        model: newModelId,
        cost: `$${modelData.perVideo.toFixed(4)}`
      }
      setItems(newItems)
    }
  }

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border-DEFAULT">
        <CardTitle className="text-lg font-bold">{label} Pipeline</CardTitle>
        <Badge variant="outline" className="font-mono bg-bg-surface2 text-muted-foreground border-border-strong">
          30 videos
        </Badge>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-4 py-3 border-b border-border-DEFAULT/50">
            <div className="w-8 text-center">#</div>
            <div className="flex-1">Topic</div>
            <div className="w-24 text-center">Day Range</div>
            <div className="w-32 text-center">Status</div>
            <div className="w-48 text-center">Model</div>
            <div className="w-24 text-right">Cost/Video</div>
          </div>
          
          {/* Rows */}
          <div className="divide-y divide-border-DEFAULT/50">
            {items.map((item, i) => (
              <div key={i} className="flex items-center px-4 py-3 hover:bg-bg-surface2/50 transition-colors">
                <div className="w-8 text-center font-mono text-xs text-muted-foreground">{i + 1}</div>
                <div className="flex-1 font-semibold text-sm truncate pr-4">{item.topic}</div>
                <div className="w-24 text-center font-mono text-xs text-muted-foreground">{item.day}</div>
                <div className="w-32 flex items-center gap-2 px-2">
                  <div className="flex-1 bg-bg-surface3 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${item.status}%`, backgroundColor: accent }}
                    />
                  </div>
                  <span className="font-mono text-[10px] w-8 text-right">{item.status}%</span>
                </div>
                <div className="w-48 px-2">
                  <Select value={item.model} onValueChange={(val) => handleModelChange(i, val as string)}>
                    <SelectTrigger className="h-7 text-xs border-border-strong bg-bg-surface3/50 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map(m => (
                        <SelectItem key={m.id} value={m.id} className="font-mono text-xs">
                          {m.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 text-right font-mono text-xs text-muted-foreground">
                  {item.cost}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
