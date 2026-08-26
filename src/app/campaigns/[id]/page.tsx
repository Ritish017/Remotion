'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  Flame,
  ShieldCheck,
  RefreshCw,
  Sliders,
  FileText,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaign, useMonthlyCalendar, generateMonthlyCalendar } from '@/hooks/useCampaign';
import type { CalendarEpisodeDay, EpisodeProductionStatus } from '@/lib/campaign/types';

const STATUS_CONFIG: Record<EpisodeProductionStatus, { label: string; color: string; bg: string }> = {
  PLANNED: { label: 'PLANNED', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
  RESEARCHING: { label: 'RESEARCHING', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  RESEARCH_COMPLETE: { label: 'RESEARCH READY', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.15)' },
  SCRIPTING: { label: 'SCRIPTING', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  SCRIPT_COMPLETE: { label: 'SCRIPT READY', color: '#9333ea', bg: 'rgba(147, 51, 234, 0.15)' },
  STORYBOARDING: { label: 'STORYBOARDING', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  VISUAL_DIRECTION_COMPLETE: { label: 'VISUAL READY', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' },
  VOICE_COMPLETE: { label: 'VOICE SYNCED', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  PREVIEW_READY: { label: 'PREVIEW READY', color: '#ffd166', bg: 'rgba(255, 209, 102, 0.2)' },
  NEEDS_REVISION: { label: 'REVISION', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  APPROVED: { label: 'APPROVED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  RENDERING: { label: 'RENDERING', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  QA: { label: 'VISUAL QA', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  COMPLETED: { label: 'COMPLETED', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' },
  FAILED: { label: 'FAILED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);

  const { campaign, isLoading: campaignLoading } = useCampaign(id);
  const { calendar, isLoading: calendarLoading, mutate: mutateCalendar } = useMonthlyCalendar(
    id,
    currentYear,
    currentMonth
  );

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleGenerateMonth = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyCalendar(id, currentYear, currentMonth);
      await mutateCalendar();
    } catch (err) {
      console.error('Failed to generate monthly calendar:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (campaignLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-slate-400 font-mono">
        Loading campaign franchise...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto py-12 space-y-4 text-center">
        <p className="text-white font-bold">Campaign franchise not found</p>
        <Button onClick={() => router.push('/campaigns')} variant="outline">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const daysList: CalendarEpisodeDay[] = calendar?.days || [];
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <button
        onClick={() => router.push('/campaigns')}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors font-mono"
      >
        <ArrowLeft size={14} /> Back to Franchises
      </button>

      {/* Campaign Franchise Header */}
      <div className="p-6 rounded-2xl bg-[#10131d] border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-rose-500" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                MONTHLY STRATEGY ENGINE
              </span>
              <span className="text-xs text-muted-foreground font-mono">{campaign.niche}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleGenerateMonth}
              disabled={isGenerating}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-amber-400/20 gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Directing 30-Day Strategy...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {daysList.length > 0 ? 'Regenerate Strategy' : 'Generate 30-Day Strategy'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Pillars */}
        {campaign.contentPillars && campaign.contentPillars.length > 0 && (
          <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Pillars:
            </span>
            {campaign.contentPillars.map((p) => (
              <span
                key={p.id || p.title}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200"
              >
                {p.title} <span className="text-muted-foreground">({Math.round(p.weight * 100)}%)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Controls & Month Picker */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className="text-amber-400" />
          <h2 className="text-base font-bold text-white font-mono">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            ({daysList.length} / {daysInMonth} Planned Episodes)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 px-2.5 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 px-2.5 bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* 30-Day Monthly Calendar Grid */}
      {calendarLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : daysList.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <CalendarIcon size={40} className="mx-auto text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <p className="text-base font-bold text-white">
              No Strategy Generated for {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click the button below to allow Catalyst Campaign Director to synthesize a full 30-day progressive documentary plan with unique Episode DNA and verified novelty scoring.
            </p>
          </div>
          <Button
            onClick={handleGenerateMonth}
            disabled={isGenerating}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-10 px-5 rounded-xl gap-2"
          >
            <Sparkles size={14} />
            Generate {MONTH_NAMES[currentMonth - 1]} Calendar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {daysList.map((day) => {
            const statusConfig = STATUS_CONFIG[day.overallStatus] || STATUS_CONFIG.DRAFT;
            const novelty = day.visualNoveltyScore || 85;

            return (
              <button
                key={day.id}
                onClick={() => router.push(`/campaigns/${id}/episodes/${day.id}`)}
                className="group p-3.5 rounded-xl bg-[#11141e] hover:bg-[#161a27] border border-white/5 hover:border-amber-400/50 text-left transition-all flex flex-col justify-between space-y-3 relative overflow-hidden shadow-md hover:shadow-black/60 focus:outline-none"
              >
                {/* Date Header & Novelty Badge */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Day {day.dayIndex}
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: novelty >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      borderColor: novelty >= 80 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                      color: novelty >= 80 ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {novelty}% NOVEL
                  </span>
                </div>

                {/* Title & Pillar */}
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                    {day.title || day.topic}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {day.contentPillar}
                  </p>
                </div>

                {/* Status Footer */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between w-full">
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] py-0 h-4 border-transparent"
                    style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </Badge>

                  <span className="text-[10px] font-mono text-muted-foreground group-hover:text-white transition-colors flex items-center gap-0.5">
                    Studio <Play size={8} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
