import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import type { Episode, PlatformPost } from '@/lib/types'

const fetchEpisode = async (id: string): Promise<Episode | null> => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

const fetchPlatformPosts = async (episodeId: string): Promise<PlatformPost[]> => {
  const { data, error } = await supabase
    .from('platform_posts')
    .select('*')
    .eq('episode_id', episodeId)
  if (error) throw error
  return data || []
}

export function useEpisode(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Episode | null>(
    id ? `episode-${id}` : null,
    () => fetchEpisode(id)
  )
  return { episode: data, error, isLoading, mutate }
}

export function usePlatformPosts(episodeId: string) {
  const { data, error, isLoading, mutate } = useSWR<PlatformPost[]>(
    episodeId ? `platform-posts-${episodeId}` : null,
    () => fetchPlatformPosts(episodeId)
  )
  return { posts: data || [], error, isLoading, mutate }
}

export async function updateEpisode(id: string, updates: Partial<Episode>) {
  const { data, error } = await supabase
    .from('episodes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function upsertPlatformPost(post: Partial<PlatformPost> & { episode_id: string; platform: string }) {
  const { data: existing } = await supabase
    .from('platform_posts')
    .select('id')
    .eq('episode_id', post.episode_id)
    .eq('platform', post.platform)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('platform_posts')
      .update(post)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('platform_posts')
      .insert(post)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
