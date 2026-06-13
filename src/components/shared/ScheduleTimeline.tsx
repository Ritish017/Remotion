import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ScheduleSlot {
  time: string
  title: string
  status: 'done' | 'active' | 'upcoming'
  platform: string
}

interface ScheduleTimelineProps {
  slots: ScheduleSlot[]
}

export function ScheduleTimeline({ slots }: ScheduleTimelineProps) {
  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground font-mono">
            No scheduled videos
          </div>
        ) : (
          <div className="relative border-l border-border-strong ml-3 space-y-6 pb-4">
            {slots.map((slot, i) => {
              const isDone = slot.status === 'done'
              const isActive = slot.status === 'active'
              const isUpcoming = slot.status === 'upcoming'

              return (
                <div key={i} className={`relative pl-6 ${isDone ? 'opacity-60' : ''}`}>
                  {/* Timeline Dot */}
                  <span className="absolute -left-[5px] top-1.5 flex h-2.5 w-2.5 items-center justify-center">
                    {isDone && <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-accent-ai" />}
                    {isActive && (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-brand opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-brand" />
                      </>
                    )}
                    {isUpcoming && <span className="absolute inline-flex h-2.5 w-2.5 rounded-full border-2 border-muted-foreground bg-bg-surface" />}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold w-12">{slot.time}</span>
                      <Badge variant="outline" className={`text-[10px] py-0 h-4 border-border-strong ${isDone ? 'bg-bg-surface2 text-muted-foreground' : isActive ? 'bg-accent-brand/10 text-accent-brand border-accent-brand/30' : 'bg-transparent text-muted-foreground'}`}>
                        {slot.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 h-4 border-border-strong bg-transparent text-muted-foreground uppercase">
                        {slot.platform}
                      </Badge>
                    </div>
                    <div className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {slot.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
