import { useState, useCallback } from 'react'
import type { ResearchBrief } from '@/lib/types'

export function useResearch() {
  const [research, setResearch] = useState<ResearchBrief | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runResearch = useCallback(async (topic: string, campaignType: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, campaignType }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResearch(data.research)
      return data.research
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { research, isLoading, error, runResearch }
}
