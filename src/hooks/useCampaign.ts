import useSWR from 'swr';
import type { Campaign, MonthlyContentCalendar } from '@/lib/campaign/types';
import type { Episode } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API request failed');
  return res.json();
});

export function useCampaigns() {
  const { data, error, isLoading, mutate } = useSWR<{ campaigns: Campaign[] }>('/api/campaigns', fetcher);
  return { campaigns: data?.campaigns || [], error, isLoading, mutate };
}

export function useCampaign(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ campaign: Campaign }>(
    id ? `/api/campaigns/${id}` : null,
    fetcher
  );
  return { campaign: data?.campaign ? {
    ...data.campaign,
    // Add compatibility properties for legacy components
    accent_color: (data.campaign as any).accent_color || '#ffd166',
    target_platforms: (data.campaign as any).target_platforms || data.campaign.platforms || [],
    type: (data.campaign as any).type || data.campaign.niche || 'technology',
    status: (data.campaign as any).status || 'active',
  } : null, error, isLoading, mutate };
}

export function useMonthlyCalendar(campaignId: string, year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR<MonthlyContentCalendar>(
    campaignId ? `/api/campaigns/${campaignId}/calendar?year=${year}&month=${month}` : null,
    fetcher
  );
  return { calendar: data, error, isLoading, mutate };
}

export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create campaign');
  }
  const data = await res.json();
  return data.campaign;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update campaign');
  }
  const data = await res.json();
  return data.campaign;
}

export async function generateMonthlyCalendar(campaignId: string, year: number, month: number): Promise<MonthlyContentCalendar> {
  const res = await fetch(`/api/campaigns/${campaignId}/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, month }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate monthly calendar');
  }
  return res.json();
}
