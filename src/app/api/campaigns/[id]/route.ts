import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { CampaignSchema } from '@/lib/campaign/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = DatabaseFactory.getProvider();
    const r = await db.getCampaign(id);

    if (!r) {
      return NextResponse.json({ error: `Campaign with id [${id}] not found` }, { status: 404 });
    }

    const campaign = {
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
    };

    return NextResponse.json({ campaign });
  } catch (error: any) {
    console.error('Campaign GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve campaign' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const db = DatabaseFactory.getProvider();

    const updates: Record<string, any> = {};
    if (body.name) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.niche) updates.niche = body.niche;
    if (body.targetAudience) updates.targetAudience = body.targetAudience;
    if (body.platforms) updates.platformsJson = JSON.stringify(body.platforms);
    if (body.publishingFrequency) updates.publishingFrequency = body.publishingFrequency;
    if (body.contentPillars) updates.contentPillarsJson = JSON.stringify(body.contentPillars);
    if (body.tone) updates.tone = body.tone;
    if (body.editorialIdentity) updates.editorialIdentityJson = JSON.stringify(body.editorialIdentity);
    if (body.visualIdentity) updates.visualIdentityJson = JSON.stringify(body.visualIdentity);
    if (body.preferredDurationSeconds) updates.preferredDurationSeconds = body.preferredDurationSeconds;
    if (body.aspectRatios) updates.aspectRatiosJson = JSON.stringify(body.aspectRatios);
    if (body.narrationStyle) updates.narrationStyleJson = JSON.stringify(body.narrationStyle);
    if (body.ctaStrategy) updates.ctaStrategyJson = JSON.stringify(body.ctaStrategy);
    if (body.monthlyStrategy) updates.monthlyStrategyJson = JSON.stringify(body.monthlyStrategy);

    const updated = await db.updateCampaign(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Campaign with id [${id}] not found` }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated });
  } catch (error: any) {
    console.error('Campaign PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update campaign' }, { status: 500 });
  }
}
