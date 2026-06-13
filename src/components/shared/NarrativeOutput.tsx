'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { NarrativeOutput as NarrativeOutputType } from '@/lib/types'
import { Check, Copy, Send, BookmarkPlus } from 'lucide-react'
import { useState } from 'react'
import { VERTICALS } from '@/lib/constants'

interface NarrativeOutputProps {
  narrative: NarrativeOutputType
  verticalId: string
  onSendToCatalyst: () => void
  onSaveTemplate: () => void
}

export function NarrativeOutput({ narrative, verticalId, onSendToCatalyst, onSaveTemplate }: NarrativeOutputProps) {
  const [copied, setCopied] = useState<string | null>(null)
  
  const vertical = VERTICALS.find(v => v.id === verticalId)
  const accent = vertical?.accent || '#6c47ff'

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sections = [
    { id: 'hook', label: 'Hook', data: narrative.hook },
    { id: 'problem', label: 'Problem', data: narrative.problem },
    { id: 'solution', label: 'Solution', data: narrative.solution },
    { id: 'cta', label: 'CTA', data: narrative.cta },
  ]

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />
      <CardHeader className="border-b border-border-DEFAULT pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl font-extrabold leading-tight">{narrative.title}</CardTitle>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
            <span className="text-3xl font-extrabold" style={{ color: accent }}>{narrative.virality_score}</span>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-border-strong text-muted-foreground bg-transparent">
              {narrative.virality_label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-5 space-y-6">
          <div className="space-y-4">
            {sections.map(section => (
              <div key={section.id} className="border border-border-DEFAULT rounded-lg p-4 bg-bg-surface2 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{section.label}</span>
                  {('stat' in section.data) && (
                    <Badge variant="secondary" className="bg-bg-surface3 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                      {section.data.stat}
                    </Badge>
                  )}
                </div>
                
                {('headline' in section.data) && (
                  <h4 className="font-bold mb-2">{section.data.headline}</h4>
                )}
                
                {('text' in section.data) && (
                  <h4 className="font-bold mb-2">{section.data.text}</h4>
                )}
                
                {('subtext' in section.data) && (
                  <p className="text-sm text-muted-foreground">{section.data.subtext}</p>
                )}
                
                {('bullets' in section.data) && (
                  <ul className="list-disc pl-4 space-y-1">
                    {(section.data.bullets as string[]).map((b, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{b}</li>
                    ))}
                  </ul>
                )}
                
                {('key_points' in section.data) && (
                  <ul className="list-disc pl-4 space-y-1">
                    {(section.data.key_points as string[]).map((b, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{b}</li>
                    ))}
                  </ul>
                )}
                
                {('urgency' in section.data) && (
                  <p className="text-sm text-accent-social mt-2 font-medium">{section.data.urgency}</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Title Variants</h4>
            <div className="grid grid-cols-1 gap-2">
              {narrative.title_variants.map((tv, i) => (
                <div key={i} className="flex items-center gap-2 bg-bg-surface2 border border-border-DEFAULT rounded-md p-2">
                  <span className="font-mono text-xs text-muted-foreground w-4">{i+1}</span>
                  <span className="flex-1 text-sm font-medium">{tv}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(tv, `tv-${i}`)}
                  >
                    {copied === `tv-${i}` ? <Check size={12} /> : <Copy size={12} />}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {narrative.hashtags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-bg-surface3 text-muted-foreground border-border-strong font-mono text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">YouTube / IG Description</h4>
            <Textarea 
              className="bg-bg-surface2 border-border-DEFAULT text-sm font-mono min-h-[120px] resize-y"
              defaultValue={narrative.description}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border-DEFAULT bg-bg-surface2 p-4 flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="bg-transparent border-border-strong text-foreground hover:bg-bg-surface3 font-mono text-xs h-9"
          onClick={() => copyToClipboard(JSON.stringify(narrative, null, 2), 'json')}
        >
          {copied === 'json' ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
          Copy JSON
        </Button>
        <Button 
          variant="outline" 
          className="bg-transparent border-border-strong text-foreground hover:bg-bg-surface3 font-mono text-xs h-9"
          onClick={onSaveTemplate}
        >
          <BookmarkPlus size={14} className="mr-2" />
          Save Template
        </Button>
        <div className="flex-1"></div>
        <Button 
          className="text-foreground hover:opacity-90 font-mono text-xs h-9 shadow-none border-none"
          style={{ backgroundColor: accent }}
          onClick={onSendToCatalyst}
        >
          <Send size={14} className="mr-2" />
          Send to Catalyst
        </Button>
      </CardFooter>
    </Card>
  )
}
