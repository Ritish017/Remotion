'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Brain,
  Zap,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Radio,
  Cpu,
  Globe,
  Coins,
  Rocket,
  Atom,
  Clock,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCampaigns, createCampaign } from '@/hooks/useCampaign';
import type { Campaign } from '@/lib/campaign/types';

const CAMPAIGN_PRESETS = [
  {
    name: 'Daily AI News',
    niche: 'Artificial Intelligence & Neural Architectures',
    description: 'Daily fast-paced investigative breakdowns of breaking AI research, compute scaling, and frontier models.',
    icon: Brain,
    tone: 'Investigative, urgent, empirical, broadcast-grade',
    pillars: [
      { id: 'p1', title: 'Frontier Models', description: 'Architecture & benchmark shifts', weight: 0.35 },
      { id: 'p2', title: 'Compute & Silicon', description: 'GPU clusters & chip fabrication', weight: 0.25 },
      { id: 'p3', title: 'Autonomous Agents', description: 'Enterprise workflows & reasoning systems', weight: 0.25 },
      { id: 'p4', title: 'Geopolitics & Policy', description: 'Global export corridors & safety', weight: 0.15 },
    ],
    accent: '#ffd166',
  },
  {
    name: 'Future Technology',
    niche: 'Quantum Computing, Fusion & Space Infrastructure',
    description: 'Cinematic deep dives into the deep-tech engineering breakthroughs reshaping the next 50 years.',
    icon: Rocket,
    tone: 'Cinematic, awe-inspiring, high-density, analytical',
    pillars: [
      { id: 'p1', title: 'Commercial Fusion', description: 'Magnetic & inertial confinement engineering', weight: 0.30 },
      { id: 'p2', title: 'Quantum Telemetry', description: 'Superconducting qubits & error mitigation', weight: 0.25 },
      { id: 'p3', title: 'Orbital Logistics', description: 'Starship economy & space manufacturing', weight: 0.25 },
      { id: 'p4', title: 'Next-Gen Materials', description: 'Superconductors & synthetic biology', weight: 0.20 },
    ],
    accent: '#00c9a7',
  },
  {
    name: 'Robotics & Embodied AI',
    niche: 'Humanoids, Actuation & Factory Automation',
    description: 'Empirical tear-downs of humanoid kinematics, tactile sensing, and end-to-end foundation policies.',
    icon: Cpu,
    tone: 'Rigorous engineering, industrial, technical, authoritative',
    pillars: [
      { id: 'p1', title: 'Humanoid Hardware', description: 'Harmonic drives, actuators & battery density', weight: 0.30 },
      { id: 'p2', title: 'Spatial Intelligence', description: 'Vision-language-action foundation models', weight: 0.30 },
      { id: 'p3', title: 'Factory Deployment', description: 'Automotive assembly & logistics economics', weight: 0.25 },
      { id: 'p4', title: 'Sim-to-Real Transfer', description: 'Physics simulation & synthetic telemetry', weight: 0.15 },
    ],
    accent: '#f0522a',
  },
  {
    name: 'Finance Explained',
    niche: 'High-Frequency Trading, Global Macro & Liquidity',
    description: 'Investigative documentaries unpacking sub-millisecond execution, market microstructure, and sovereign debt.',
    icon: Coins,
    tone: 'Dark terminal aesthetic, forensic, rapid-fire, data-driven',
    pillars: [
      { id: 'p1', title: 'Low-Latency Networks', description: 'Dark fiber, microwave towers & FPGA execution', weight: 0.35 },
      { id: 'p2', title: 'Global Liquidity', description: 'Repo markets & central bank balance sheets', weight: 0.25 },
      { id: 'p3', title: 'Derivatives Architecture', description: 'Options gamma & market maker hedging', weight: 0.25 },
      { id: 'p4', title: 'Fintech Protocols', description: 'Real-time payment rails & settlement speed', weight: 0.15 },
    ],
    accent: '#4cc9f0',
  },
  {
    name: 'Science Explained',
    niche: 'Fundamental Physics, Neuroscience & Molecular Biology',
    description: 'Documentary investigations into how the physical universe functions at microscopic and cosmological extremes.',
    icon: Atom,
    tone: 'Climactic revelation, elegant clarity, scientific rigor',
    pillars: [
      { id: 'p1', title: 'Cosmology & Gravity', description: 'Black hole horizons & cosmic background radiation', weight: 0.30 },
      { id: 'p2', title: 'Neural Correlates', description: 'Synaptic plasticity & connectome mapping', weight: 0.25 },
      { id: 'p3', title: 'Genomic Engineering', description: 'CRISPR base editing & protein folding', weight: 0.25 },
      { id: 'p4', title: 'Thermodynamics', description: 'Entropy, heat engines & information theory', weight: 0.20 },
    ],
    accent: '#b5179e',
  },
  {
    name: 'Startup Intelligence',
    niche: 'Venture Economics, Network Effects & Founder Strategy',
    description: 'Forensic case studies on viral loops, enterprise software margins, and moats.',
    icon: TrendingUp,
    tone: 'Strategic, insider, sharp, analytical',
    pillars: [
      { id: 'p1', title: 'Unit Economics', description: 'CAC/LTV ratios & net revenue retention', weight: 0.30 },
      { id: 'p2', title: 'Distribution Moats', description: 'PLG flywheels & developer evangelism', weight: 0.30 },
      { id: 'p3', title: 'Venture Dynamics', description: 'Term sheet mechanics & liquidation preferences', weight: 0.20 },
      { id: 'p4', title: 'Platform Pivots', description: 'API business models & infrastructure capture', weight: 0.20 },
    ],
    accent: '#7209b7',
  },
];

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const primaryPalette = campaign.visualIdentity?.primaryPalette || 'vox_investigation_dark';
  const pillarsCount = campaign.contentPillars?.length || 0;

  return (
    <button
      onClick={() => router.push(`/campaigns/${campaign.id}`)}
      className="group text-left w-full focus:outline-none"
    >
      <Card className="bg-[#10131c] border-white/10 hover:border-amber-400/40 transition-all duration-200 hover:shadow-xl hover:shadow-black/50 overflow-hidden relative">
        {/* Glowing top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-rose-500" />
        
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Radio size={20} className="text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {campaign.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{campaign.niche}</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              AUTONOMOUS STUDIO
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {campaign.description && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          )}

          {/* Pillars List */}
          {campaign.contentPillars && campaign.contentPillars.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Content Pillars ({pillarsCount})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.contentPillars.slice(0, 4).map((p) => (
                  <span
                    key={p.id || p.title}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                  >
                    {p.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-amber-400" />
              {campaign.preferredDurationSeconds || 45}s Documentary
            </span>
            <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform">
              Monthly Calendar <ArrowRight size={12} />
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const { campaigns, isLoading, mutate } = useCampaigns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: '',
    niche: '',
    description: '',
    tone: 'Investigative, empirical, broadcast-grade, authoritative',
    targetAudience: 'Curious developers, engineers, and tech decision-makers',
    preferredDurationSeconds: 45,
    pillars: [
      { id: 'p1', title: 'Core Mechanics', description: 'Fundamental principles', weight: 0.35 },
      { id: 'p2', title: 'Scale & Scaling Laws', description: 'Exponential growth & economics', weight: 0.25 },
      { id: 'p3', title: 'Friction & Bottlenecks', description: 'Physical & thermal limits', weight: 0.25 },
      { id: 'p4', title: 'Future Frontiers', description: 'Next 5-10 year horizons', weight: 0.15 },
    ],
  });

  const handleApplyPreset = (preset: typeof CAMPAIGN_PRESETS[0]) => {
    setForm({
      name: preset.name,
      niche: preset.niche,
      description: preset.description,
      tone: preset.tone,
      targetAudience: 'Engineers, builders, researchers, and technology executives',
      preferredDurationSeconds: 45,
      pillars: preset.pillars,
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const created = await createCampaign({
        name: form.name,
        niche: form.niche || 'Technology & Engineering',
        description: form.description,
        tone: form.tone,
        targetAudience: form.targetAudience,
        preferredDurationSeconds: form.preferredDurationSeconds,
        contentPillars: form.pillars,
        platforms: ['youtube-shorts', 'tiktok', 'instagram-reels'],
        publishingFrequency: 'daily',
      });
      await mutate();
      setIsModalOpen(false);
      router.push(`/campaigns/${created.id}`);
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#141824] to-[#0d1017] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AUTONOMOUS STUDIO ENGINE
            </span>
            <span className="text-xs text-muted-foreground font-mono">30-Day Monthly Production</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Documentary Campaign Franchises
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Create multi-episode editorial campaigns. Catalyst independently art-directs every episode with unique Episode DNA and guaranteed visual novelty ($\ge 75$).
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-11 px-5 rounded-xl shadow-lg shadow-amber-400/20 gap-2 shrink-0 z-10"
        >
          <Plus size={16} />
          New Campaign Franchise
        </Button>
      </div>

      {/* Flagship Franchise Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            Instant Franchise Blueprints
          </h2>
          <span className="text-xs text-muted-foreground font-mono">1-Click Launch</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CAMPAIGN_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  handleApplyPreset(preset);
                  setIsModalOpen(true);
                }}
                className="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-400/40 text-left transition-all flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Icon size={16} style={{ color: preset.accent }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {preset.niche}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Campaigns Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <Layers size={14} className="text-amber-400" />
          Active Campaigns ({campaigns.length})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <Radio size={36} className="mx-auto text-muted-foreground opacity-40" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">No Campaign Franchises Yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first editorial campaign or select an Instant Blueprint above to generate a 30-day documentary strategy.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-9 px-4 rounded-lg"
            >
              Create Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-[#0f121a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Configure Documentary Campaign Franchise
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-slate-300">Campaign Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Daily AI News"
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-slate-300">Niche / Domain</Label>
                <Input
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="e.g. Artificial Intelligence & Silicon"
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-slate-300">Editorial Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="High-level mission and narrative angle of this content franchise..."
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-slate-300">Tone & Voice</Label>
                <Input
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                  placeholder="Investigative, empirical, broadcast-grade"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono text-slate-300">Target Audience</Label>
                <Input
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="Developers, engineers, researchers"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            {/* Content Pillars */}
            <div className="space-y-2">
              <Label className="text-xs font-mono text-slate-300">Content Pillars (Monthly Topic Coverage)</Label>
              <div className="grid grid-cols-2 gap-2">
                {form.pillars.map((pillar, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 space-y-1">
                    <Input
                      value={pillar.title}
                      onChange={(e) => {
                        const newPillars = [...form.pillars];
                        newPillars[idx].title = e.target.value;
                        setForm({ ...form, pillars: newPillars });
                      }}
                      placeholder={`Pillar ${idx + 1}`}
                      className="h-7 text-xs bg-transparent border-none text-amber-300 font-bold px-1"
                    />
                    <Input
                      value={pillar.description}
                      onChange={(e) => {
                        const newPillars = [...form.pillars];
                        newPillars[idx].description = e.target.value;
                        setForm({ ...form, pillars: newPillars });
                      }}
                      placeholder="Description"
                      className="h-6 text-[10px] bg-transparent border-none text-muted-foreground px-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !form.name.trim()}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
              >
                {creating ? 'Creating...' : 'Create Franchise'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
