'use client'

import useSWR from 'swr'
import { Brain, RefreshCw } from 'lucide-react'
import { BrainDecisionCard } from './BrainDecisionCard'
import { WorldContextFeed } from './WorldContextFeed'
import { BrainHistoryLog } from './BrainHistoryLog'
import { ManualOverride } from './ManualOverride'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface BrainPanelProps {
  campaignId: string
  accentColor?: string
}

export function BrainPanel({ campaignId, accentColor = '#6c47ff' }: BrainPanelProps) {
  const { data: status, mutate: mutateStatus, isLoading: statusLoading } = useSWR(
    `/api/brain/status?campaign=${campaignId}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: history, mutate: mutateHistory, isLoading: historyLoading } = useSWR(
    `/api/brain/history?campaign=${campaignId}`,
    fetcher
  )

  const latestRun = status?.latest_run
  const memory = status?.memory
  const runs = Array.isArray(history) ? history : []

  function handleBrainComplete() {
    mutateStatus()
    mutateHistory()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20` }}>
            <Brain size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Campaign Brain</h2>
            <p className="text-xs text-muted-foreground">Autonomous content intelligence</p>
          </div>
        </div>

        <button
          onClick={() => { mutateStatus(); mutateHistory() }}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-bg-surface2"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Memory stats */}
      {memory && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-surface rounded-lg p-3 border border-border-DEFAULT text-center">
            <p className="text-xl font-bold font-mono" style={{ color: accentColor }}>
              {(memory.topics_covered || []).length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Topics covered</p>
          </div>
          <div className="bg-bg-surface rounded-lg p-3 border border-border-DEFAULT text-center">
            <p className="text-xl font-bold font-mono" style={{ color: accentColor }}>
              {runs.length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Brain runs</p>
          </div>
          <div className="bg-bg-surface rounded-lg p-3 border border-border-DEFAULT text-center">
            <p className="text-xl font-bold font-mono" style={{ color: accentColor }}>
              {latestRun?.confidence ?? '—'}
              {latestRun?.confidence !== undefined && '%'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Last confidence</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          {/* Latest decision */}
          {statusLoading ? (
            <div className="h-40 bg-bg-surface rounded-lg border border-border-DEFAULT animate-pulse" />
          ) : latestRun ? (
            <BrainDecisionCard run={latestRun} accentColor={accentColor} />
          ) : (
            <div className="bg-bg-surface rounded-lg border border-border-DEFAULT p-8 text-center">
              <Brain size={28} className="text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted-foreground">No brain runs yet</p>
              <p className="text-xs text-muted-foreground mt-1">Trigger a run to see today's content decision</p>
            </div>
          )}

          {/* World context from last run */}
          {latestRun?.world_context && (
            <WorldContextFeed context={latestRun.world_context} accentColor={accentColor} />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <ManualOverride
            campaignId={campaignId}
            accentColor={accentColor}
            onComplete={handleBrainComplete}
          />

          {historyLoading ? (
            <div className="h-40 bg-bg-surface rounded-lg border border-border-DEFAULT animate-pulse" />
          ) : (
            <BrainHistoryLog runs={runs} accentColor={accentColor} />
          )}
        </div>
      </div>
    </div>
  )
}
