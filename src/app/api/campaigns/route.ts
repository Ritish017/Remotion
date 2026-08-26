import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { CampaignSchema } from '@/lib/campaign/types';

export async function GET() {
  try {
    const db = DatabaseFactory.getProvider();
    const records = await db.listCampaigns();

    const campaigns = records.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      niche: r.niche || 'Technology & AI',
      targetAudience: r.targetAudience || 'General Audience',
      platforms: JSON.parse(r.platformsJson || '["youtube-shorts"]'),
      publishingFrequency: r.publishingFrequency || 'daily',
      contentPillars: JSON.parse(r.contentPillarsJson || '[]'),
      tone: r.tone || 'Investigative, analytical',
      editorialIdentity: r.editorialIdentityJson ? JSON.parse(r.editorialIdentityJson) : undefined,
      visualIdentity: r.visualIdentityJson ? JSON.parse(r.visualIdentityJson) : undefined,
      preferredDurationSeconds: r.preferredDurationSeconds || 45,
      aspectRatios: JSON.parse(r.aspectRatiosJson || '["9:16"]'),
      narrationStyle: r.narrationStyleJson ? JSON.parse(r.narrationStyleJson) : undefined,
      ctaStrategy: r.ctaStrategyJson ? JSON.parse(r.ctaStrategyJson) : undefined,
      monthlyStrategy: r.monthlyStrategyJson ? JSON.parse(r.monthlyStrategyJson) : undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error('Campaigns GET API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to list campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `camp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const campaignData = CampaignSchema.parse({
      ...body,
      id,
    });

    const db = DatabaseFactory.getProvider();
    const record = await db.createCampaign({
      id: campaignData.id,
      name: campaignData.name,
      description: campaignData.description,
      niche: campaignData.niche,
      targetAudience: campaignData.targetAudience,
      platformsJson: JSON.stringify(campaignData.platforms),
      publishingFrequency: campaignData.publishingFrequency,
      contentPillarsJson: JSON.stringify(campaignData.contentPillars),
      tone: campaignData.tone,
      editorialIdentityJson: JSON.stringify(campaignData.editorialIdentity),
      visualIdentityJson: JSON.stringify(campaignData.visualIdentity),
      preferredDurationSeconds: campaignData.preferredDurationSeconds,
      aspectRatiosJson: JSON.stringify(campaignData.aspectRatios),
      narrationStyleJson: JSON.stringify(campaignData.narrationStyle),
      ctaStrategyJson: JSON.stringify(campaignData.ctaStrategy),
      monthlyStrategyJson: campaignData.monthlyStrategy ? JSON.stringify(campaignData.monthlyStrategy) : undefined,
    });

    return NextResponse.json({ campaign: campaignData, record }, { status: 201 });
  } catch (error: any) {
    console.error('Campaigns POST API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create campaign' }, { status: 400 });
  }
}
