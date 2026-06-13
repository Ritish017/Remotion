import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
  accentColor: string
  loading?: boolean
}

export function MetricCard({ label, value, delta, deltaUp, accentColor, loading }: MetricCardProps) {
  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
      <div 
        className="h-[2px] w-full" 
        style={{ backgroundColor: accentColor }}
      />
      <CardContent className="p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
          {label}
        </p>
        
        {loading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded"></div>
        ) : (
          <div className="flex items-end justify-between">
            <h3 
              className="text-3xl font-extrabold"
              style={{ color: accentColor }}
            >
              {value}
            </h3>
            
            {delta && (
              <div className={`flex items-center gap-1 font-mono text-xs ${deltaUp ? 'text-accent-ai' : 'text-accent-social'}`}>
                {deltaUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{delta}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
