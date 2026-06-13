import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Agent } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

interface AgentGridProps {
  agents: Agent[]
  onRunAgent: (agentName: string) => void
  onToggleAgent: (agentName: string) => void
}

export function AgentGrid({ agents, onRunAgent, onToggleAgent }: AgentGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {agents.map((agent) => {
        const isActive = agent.status === 'active'
        const isIdle = agent.status === 'idle'
        const isWarn = agent.status === 'warn'

        return (
          <Card key={agent.name} className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    {isActive && (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-ai opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-ai"></span>
                      </>
                    )}
                    {isIdle && <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>}
                    {isWarn && <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-fifa"></span>}
                  </div>
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {isWarn ? (
                    <Badge variant="outline" className="bg-accent-fifa/10 text-accent-fifa border-accent-fifa/30 font-mono text-[10px] uppercase tracking-widest">
                      Needs API Key
                    </Badge>
                  ) : isActive ? (
                    <Badge variant="outline" className="bg-accent-ai/10 text-accent-ai border-accent-ai/30 font-mono text-[10px] uppercase tracking-widest">
                      Running
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-transparent text-muted-foreground border-border-strong font-mono text-[10px] uppercase tracking-widest">
                      Idle
                    </Badge>
                  )}
                  <Switch checked={isActive} onCheckedChange={() => onToggleAgent(agent.name)} />
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                {agent.description}
              </p>

              <div className="flex items-center justify-between border-t border-border-DEFAULT pt-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-bg-surface2 text-muted-foreground border-border-strong text-[10px] font-mono tracking-widest uppercase">
                    {agent.tag}
                  </Badge>
                  <div className="text-[10px] font-mono text-muted-foreground hidden sm:block">
                    Last triggered: {agent.lastTriggered || 'Not yet'}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onRunAgent(agent.name)}
                  className="h-7 text-xs font-mono border-border-strong hover:bg-bg-surface2 hover:text-foreground"
                >
                  Run Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

