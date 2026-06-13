import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import type { AnalyticsData } from '@/lib/types'

const fetchEpisodeAnalytics = async (episodeId: string): Promise<AnalyticsData[]> => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('episode_id', episodeId)
  if (error) throw error
  return data || []
}

const fetchAllAnalytics = async (): Promise<AnalyticsData[]> => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .order('fetched_at', { ascending: false })
    .limit(500)
  if (error) throw error
  return data || []
}

export function useEpisodeAnalytics(episodeId: string) {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData[]>(
    episodeId ? `analytics-${episodeId}` : null,
    () => fetchEpisodeAnalytics(episodeId)
  )
  return { analytics: data || [], error, isLoading, mutate }
}

export function useAllAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData[]>('all-analytics', fetchAllAnalytics)
  return { analytics: data || [], error, isLoading, mutate }
}
