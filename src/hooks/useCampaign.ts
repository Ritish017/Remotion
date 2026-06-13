import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import type { Campaign, Episode } from '@/lib/types'

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

const fetchCampaign = async (id: string): Promise<Campaign | null> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

const fetchCampaignEpisodes = async (campaignId: string): Promise<Episode[]> => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('episode_number', { ascending: true })
  if (error) throw error
  return data || []
}

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR<Campaign[]>('campaigns', fetchCampaigns)
  return { campaigns: data || [], error, isLoading, mutate }
}

export function useCampaign(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Campaign | null>(
    id ? `campaign-${id}` : null,
    () => fetchCampaign(id)
  )
  return { campaign: data, error, isLoading, mutate }
}

export function useCampaignEpisodes(campaignId: string) {
  const { data, error, isLoading, mutate } = useSWR<Episode[]>(
    campaignId ? `campaign-episodes-${campaignId}` : null,
    () => fetchCampaignEpisodes(campaignId)
  )
  return { episodes: data || [], error, isLoading, mutate }
}

export async function createCampaign(campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createEpisodeStubs(campaignId: string, count: number, startDate: string) {
  const episodes = Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return {
      campaign_id: campaignId,
      episode_number: i + 1,
      status: 'idea' as const,
      scheduled_date: date.toISOString().split('T')[0],
    }
  })
  const { data, error } = await supabase
    .from('episodes')
    .insert(episodes)
    .select()
  if (error) throw error
  return data
}
