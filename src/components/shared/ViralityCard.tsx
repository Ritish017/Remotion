import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface ViralityCardProps {
  score: number
  accent: string
}

export function ViralityCard({ score, accent }: ViralityCardProps) {
  const subScores = [
    { label: 'Hook Strength', value: 85 },
    { label: 'Pacing', value: 72 },
    { label: 'Emotion', value: 76 },
    { label: 'Retention', value: 68 },
  ]

  const suggestions = [
    "Lead with a contrarian statement",
    "Cut first 2s of silence",
    "Add motion in frame 1",
    "Hashtag count optimal (8–12)"
  ]

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <CardContent className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">
              Virality Score
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold" style={{ color: accent }}>
                {score}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                /100 · Good
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {subScores.map(s => (
            <div key={s.label} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">{s.label}</span>
                <span>{s.value}</span>
              </div>
              <div className="h-1.5 w-full bg-bg-surface3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${s.value}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border-DEFAULT/50 space-y-2">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
            AI Suggestions
          </h4>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground group cursor-default">
                <ArrowRight size={14} className="mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                <span className="group-hover:text-foreground transition-colors">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
