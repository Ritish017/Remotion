import { NextRequest, NextResponse } from 'next/server';
import { DatabaseFactory } from '@/lib/database';
import { runCampaignDirector } from '@/lib/ai/claude/agents/CampaignDirector';
import type { Campaign, CalendarEpisodeDay } from '@/lib/campaign/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get('year')) || new Date().getFullYear();
    const month = Number(searchParams.get('month')) || (new Date().getMonth() + 1);

    const db = DatabaseFactory.getProvider();
    const campaignRec = await db.getCampaign(id);
    if (!campaignRec) {
      return NextResponse.json({ error: `Campaign [${id}] not found` }, { status: 404 });
    }

    const allEpisodes = await db.listEpisodes(id);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthEpisodes = allEpisodes.filter((ep) => ep.scheduledDate?.startsWith(monthPrefix));

    const days: CalendarEpisodeDay[] = await Promise.all(
      monthEpisodes.map(async (ep, idx) => {
        const dnaRecord = await db.getEpisodeDNA(ep.id);
        const dna = dnaRecord?.dnaJson ? JSON.parse(dnaRecord.dnaJson) : undefined;

        return {
          id: ep.id,
          campaignId: id,
          date: ep.scheduledDate || `${monthPrefix}-${String(idx + 1).padStart(2, '0')}`,
          dayIndex: ep.episodeNumber,
          topic: ep.topic,
          title: ep.title,
          contentPillar: (ep as any).contentPillar || 'Core Pillar',
          narrativeAngle: (ep as any).narrativeAngle || 'Investigative Analysis',
          hook: (ep as any).hook || `Why this matters for ${ep.topic}`,
          estimatedDurationSeconds: (ep as any).duration || 45,
          priority: 'standard',
          researchStatus: ep.status === 'COMPLETED' ? 'completed' : 'pending',
          scriptStatus: ep.status === 'COMPLETED' ? 'completed' : 'pending',
          visualStatus: ep.status === 'COMPLETED' ? 'completed' : 'pending',
          renderStatus: ep.status === 'COMPLETED' ? 'completed' : 'pending',
          publishingStatus: 'draft',
          overallStatus: (ep.status as any) || 'DRAFT',
          visualNoveltyScore: dnaRecord?.visualNoveltyScore || 88,
          noveltyBreakdown: dnaRecord?.noveltyBreakdownJson ? JSON.parse(dnaRecord.noveltyBreakdownJson) : undefined,
        };
      })
    );

    return NextResponse.json({
      campaignId: id,
      year,
      month,
      days,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Calendar GET API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to get calendar' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const year = Number(body.year) || new Date().getFullYear();
    const month = Number(body.month) || (new Date().getMonth() + 1);

    const db = DatabaseFactory.getProvider();
    const campaignRec = await db.getCampaign(id);
    if (!campaignRec) {
      return NextResponse.json({ error: `Campaign [${id}] not found` }, { status: 404 });
    }

    const campaign: Campaign = {
      id: campaignRec.id,
      name: campaignRec.name,
      description: campaignRec.description || '',
      niche: campaignRec.niche || 'Technology & AI',
      targetAudience: campaignRec.targetAudience || 'General Audience',
      platforms: JSON.parse(campaignRec.platformsJson || '["youtube-shorts"]'),
      publishingFrequency: (campaignRec.publishingFrequency as any) || 'daily',
      contentPillars: JSON.parse(campaignRec.contentPillarsJson || '[]'),
      tone: campaignRec.tone || 'Investigative, analytical',
      editorialIdentity: campaignRec.editorialIdentityJson ? JSON.parse(campaignRec.editorialIdentityJson) : undefined,
      visualIdentity: campaignRec.visualIdentityJson ? JSON.parse(campaignRec.visualIdentityJson) : undefined,
      preferredDurationSeconds: campaignRec.preferredDurationSeconds || 45,
      aspectRatios: JSON.parse(campaignRec.aspectRatiosJson || '["9:16"]'),
      narrationStyle: campaignRec.narrationStyleJson ? JSON.parse(campaignRec.narrationStyleJson) : undefined,
      ctaStrategy: campaignRec.ctaStrategyJson ? JSON.parse(campaignRec.ctaStrategyJson) : undefined,
      monthlyStrategy: campaignRec.monthlyStrategyJson ? JSON.parse(campaignRec.monthlyStrategyJson) : undefined,
      createdAt: campaignRec.createdAt,
      updatedAt: campaignRec.updatedAt,
    };

    // Retrieve previous DNA memory from SQLite
    const visualMemoryRecords = await db.listVisualStyleMemory(id, 20);
    const historicalDNA = visualMemoryRecords.map((r) => ({
      dna: JSON.parse(r.dnaJson),
      date: r.createdAt,
      episodeId: r.episodeId,
    }));

    // Run Campaign Director
    const calendar = await runCampaignDirector({
      campaign,
      year,
      month,
      historicalDNA,
    });

    // Save generated episodes and DNA into SQLite
    for (const day of calendar.days) {
      await db.createEpisode({
        id: day.id,
        projectId: id,
        episodeNumber: day.dayIndex,
        title: day.title,
        topic: day.topic,
        status: day.overallStatus,
        scheduledDate: day.date,
      });

      if (day.visualNoveltyScore) {
        await db.saveEpisodeDNA({
          id: `dna_${day.id}`,
          episodeId: day.id,
          campaignId: id,
          dnaJson: JSON.stringify({
            episodeId: day.id,
            visualLanguage: day.contentPillar,
            visualNoveltyScore: day.visualNoveltyScore,
          }),
          visualNoveltyScore: day.visualNoveltyScore,
          noveltyBreakdownJson: day.noveltyBreakdown ? JSON.stringify(day.noveltyBreakdown) : undefined,
        });

        await db.saveVisualStyleMemory({
          id: `vsm_${day.id}`,
          campaignId: id,
          episodeId: day.id,
          visualLanguage: day.contentPillar,
          dnaJson: JSON.stringify({
            episodeId: day.id,
            topic: day.topic,
            visualLanguage: day.contentPillar,
          }),
        });
      }
    }

    return NextResponse.json(calendar, { status: 201 });
  } catch (error: any) {
    console.error('Calendar generation POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate calendar' }, { status: 500 });
  }
}
