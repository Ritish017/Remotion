'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELS } from '@/lib/constants'

export function CostCard() {
  const [selectedModel, setSelectedModel] = useState(MODELS[1].id) // Default to sonnet
  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[1]

  const totalMonthlyCost = activeModel.perVideo * 1000
  const maxBudget = 50.00 // Arbitrary budget for demo
  const budgetPercent = Math.min((totalMonthlyCost / maxBudget) * 100, 100)

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <CardHeader className="border-b border-border-DEFAULT pb-3">
        <CardTitle className="text-base font-bold flex items-center justify-between">
          Model Configuration
          <span className="text-[10px] font-mono font-normal text-muted-foreground uppercase tracking-widest">
            Cost Est
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        <div>
          <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val as string)}>
            <SelectTrigger className="w-full bg-bg-surface2 border-border-strong font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id} className="font-mono text-sm">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">In / 1M Tok</div>
            <div className="font-mono text-lg">${activeModel.inputCost.toFixed(2)}</div>
          </div>
          <div className="bg-bg-surface2 p-3 rounded-lg border border-border-DEFAULT">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Out / 1M Tok</div>
            <div className="font-mono text-lg">${activeModel.outputCost.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Est. 1K Videos/mo</span>
            <span className="font-mono text-sm font-bold text-accent-social">
              ${totalMonthlyCost.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-bg-surface3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-social transition-all duration-500 rounded-full"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <div className="text-right text-[10px] font-mono text-muted-foreground mt-1">
            Budget: $50.00
          </div>
        </div>

        <div className="pt-3 border-t border-border-DEFAULT/50 space-y-1.5">
          {MODELS.map(m => (
            <div key={m.id} className={`flex items-center justify-between font-mono text-[10px] ${m.id === selectedModel ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
              <span>{m.id}</span>
              <span>${m.perVideo.toFixed(5)}/vid</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
