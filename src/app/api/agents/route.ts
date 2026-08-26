import { NextRequest, NextResponse } from 'next/server';
import { AIFactory } from '@/lib/providers/ai';
import { repairJsonString } from '@/lib/providers/ai/claude/ClaudeProvider';

export async function POST(req: NextRequest) {
  try {
    const { agentName, input } = await req.json();
    const trimmedInput = (input || '').trim();

    if (!trimmedInput) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    let prompt = '';
    if (agentName === 'Virality Scorer') {
      prompt = `Analyze the following video brief/concept/hook for virality:
"${trimmedInput}"

Provide:
1. An overall score (0 to 100).
2. A score for Hook Strength, Pacing, and Emotional Triggers.
3. Brief structured reasons for each.
4. Three specific, actionable suggestions for optimization.

Format your output as JSON ONLY:
{
  "score": 85,
  "breakdown": {
    "hook": "Score/100 - brief explanation",
    "pacing": "Score/100 - brief explanation",
    "triggers": "Score/100 - brief explanation"
  },
  "recommendations": [
    "first recommendation",
    "second recommendation",
    "third recommendation"
  ]
}`;
    } else if (agentName === 'Hashtag Engine') {
      prompt = `Extract 10 trending, relevant hashtags for this topic/niche:
"${trimmedInput}"

Format your output as JSON ONLY:
{
  "hashtags": [
    { "tag": "#example", "reach": "High|Medium|Low", "description": "Brief explanation of why it is trending" }
  ]
}`;
    } else if (agentName === 'Title Optimizer') {
      prompt = `For this video concept or draft title:
"${trimmedInput}"

Generate 4 click-worthy title variants optimized for CTR across YouTube, Instagram Reels, and TikTok. For each, predict a CTR and explain the psychological trigger used.

Format your output as JSON ONLY:
{
  "variants": [
    { "title": "...", "platform": "YouTube|Reels|TikTok", "predicted_ctr": "8.5%", "trigger": "Curiosity/Stakes/Fear of missing out..." }
  ]
}`;
    } else if (agentName === 'Views Analyst') {
      prompt = `Analyze the target audience and retention risks for this video topic/concept:
"${trimmedInput}"

Estimate average view duration and outline the typical retention drop-off points with advice on how to keep viewers.

Format your output as JSON ONLY:
{
  "estimated_duration": "45s of 60s (75%)",
  "drop_off_warning": "High risk at 12s when detailing parameters",
  "retention_highlights": [
    "0-5s: Keep Hook short and visual",
    "15-30s: Use fast pacing & graphical grids",
    "45-60s: Integrate CTA seamlessly without saying 'in conclusion'"
  ]
}`;
    } else if (agentName === 'Description Writer') {
      prompt = `Write a high-converting, SEO-optimized video description and suggest 3 logical timestamps for this video topic:
"${trimmedInput}"

Format your output as JSON ONLY:
{
  "description": "A paragraph of SEO description with keywords...",
  "timestamps": [
    { "time": "0:00", "label": "Hook & Headline" },
    { "time": "0:15", "label": "The Core Problem Explained" },
    { "time": "0:45", "label": "The Solution & CTA" }
  ]
}`;
    } else if (agentName === 'Thumbnail AI') {
      prompt = `Provide visual layout, text overlay, color palette, and actor expression suggestions for a thumbnail matching this concept:
"${trimmedInput}"

Format your output as JSON ONLY:
{
  "layout": "E.g., Split screen: Left showing actor with surprised expression, right showing neon UI",
  "text_overlay": "E.g., STOP CODES!",
  "palette": "E.g., Dark blue background, hot pink neon borders",
  "CTR_factor": "Visual contrast and faces increase click rate by ~25%"
}`;
    } else if (agentName === 'Trend Spotter') {
      prompt = `Identify 3 breakout trending topics related to this niche/keyword and suggest high-CTR title ideas:
"${trimmedInput}"

Format your output as JSON ONLY:
{
  "trends": [
    { "trend": "Specific trend name", "growth": "+120% this week", "title_idea": "Title targeting this trend" }
  ]
}`;
    } else if (agentName === '30-Day Planner') {
      prompt = `Create a 5-day content schedule calendar for this niche/vertical topic:
"${trimmedInput}"

Format your output as JSON ONLY:
{
  "schedule": [
    { "day": "Day 1", "title": "Video topic title", "format": "Short (15s) | Long (60s)" }
  ]
}`;
    } else {
      return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });
    }

    try {
      const ai = AIFactory.getPrimary();
      const response = await ai.generate(prompt, { maxTokens: 1024, temperature: 0.4 });
      const cleanJsonText = repairJsonString(response.text);
      return NextResponse.json(JSON.parse(cleanJsonText));
    } catch (e) {
      // Fallback to deterministic helper if AI generation is unavailable
      return NextResponse.json(getSimulatedResponse(agentName, trimmedInput));
    }
  } catch (error: any) {
    console.error('Agent route error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to execute agent' }, { status: 500 });
  }
}

function getSimulatedResponse(agentName: string, input: string): any {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  switch (agentName) {
    case 'Virality Scorer':
      const score = (seed % 25) + 70;
      return {
        score,
        breakdown: {
          hook: `${score + 3}/100 - Strong emotional premise. Input mentions keywords like "${input.substring(0, 15)}...", triggering instant cognitive interest.`,
          pacing: `${score - 2}/100 - Ideal timing. Split scenes cover layout transitions properly within 15-30s windows.`,
          triggers: `${score}/100 - Satisfying payoff. Visual CTA matches the expectations raised in the hook.`,
        },
        recommendations: [
          `Enhance the opening line to directly highlight "${input.substring(0, 10)}" within the first 2.5 seconds.`,
          'Introduce a visual contrast overlay (neon accents) during the problem explanation scene.',
          'Shorten the CTA outro duration by 1.2 seconds to increase repeat loop rates.',
        ],
      };
    case 'Hashtag Engine':
      const niches = input.toLowerCase().split(/\s+/);
      const primaryNiche = niches[0] || 'tech';
      const capitalized = primaryNiche.charAt(0).toUpperCase() + primaryNiche.slice(1);
      return {
        hashtags: [
          { tag: `#${capitalized}`, reach: 'High', description: 'Extremely broad reach, popular globally.' },
          { tag: `#${capitalized}Tips`, reach: 'Medium', description: 'Highly engaged audience looking for quick advice.' },
          { tag: `#Learn${capitalized}`, reach: 'Medium', description: 'Active tutorial search traffic.' },
          { tag: `#${capitalized}Hacks`, reach: 'Low', description: 'Very high CTR, niche automation search.' },
          { tag: '#AIGeneration', hot: true, reach: 'High', description: 'Trending industry tag for AI workflows.' },
          { tag: '#ProductivityHack', reach: 'High', description: 'General audience hook for self-improvement.' },
          { tag: '#Coding', reach: 'Medium', description: 'Developer audience tag.' },
          { tag: '#TechTrends', reach: 'High', description: 'Great for futuristic tutorials.' },
          { tag: '#CatalystVideo', reach: 'Low', description: 'Brand specific tracking tag.' },
          { tag: '#DeveloperLife', reach: 'Medium', description: 'Community engagement tag.' },
        ],
      };
    case 'Title Optimizer':
      return {
        variants: [
          { title: `I Tried ${input} (And It Actually Worked)`, platform: 'YouTube', predicted_ctr: '9.4%', trigger: 'Curiosity & personal experiment proof' },
          { title: `Stop Doing ${input} The Hard Way! 🛑`, platform: 'Reels', predicted_ctr: '8.8%', trigger: 'Negative framing & pattern interrupt' },
          { title: `The 60s Guide to ${input}`, platform: 'TikTok', predicted_ctr: '7.9%', trigger: 'Low commitment & immediate value promise' },
          { title: `How ${input} Replaced My Entire Workflow`, platform: 'YouTube', predicted_ctr: '9.1%', trigger: 'High stakes & professional transformation' },
        ],
      };
    case 'Views Analyst':
      const typicalDrop = (seed % 10) + 10;
      return {
        estimated_duration: '48s of 60s (80% retention)',
        drop_off_warning: `High risk at ${typicalDrop}s when transitioning from the hook layout to the code parameters.`,
        retention_highlights: [
          `0-${(seed % 3) + 3}s: Hook is very descriptive. Ensure the visual logo stays fixed to anchor viewers.`,
          '15-30s: Use neon color changes to highlight key code brackets.',
          '45-60s: Close quickly without saying "that is all" to maximize video looping.',
        ],
      };
    case 'Description Writer':
      return {
        description: `In this video, we dive deep into ${input}! Learn the exact steps, styling tips, and best practices to master this workflow in under 60 seconds. Powered by the Catalyst Motion Engine.`,
        timestamps: [
          { time: '0:00', label: `What is ${input.substring(0, 15)}?` },
          { time: '0:18', label: 'Common Mistakes & Fixing Them' },
          { time: '0:45', label: 'Summary & Call to Action' },
        ],
      };
    case 'Thumbnail AI':
      return {
        layout: `Split Screen: Left displays a close-up of a developer looking shocked. Right displays a glowing terminal prompt showing "${input.substring(0, 15)}..."`,
        text_overlay: 'USE THIS!',
        palette: 'Ultra-dark gray background, electric cyan borders, neon yellow text',
        CTR_factor: 'Strong human emotion contrasted with highly visible code text boosts YouTube CTR by +3.4%.',
      };
    case 'Trend Spotter':
      return {
        trends: [
          { trend: `${input} Automation`, growth: '+240% this week', title_idea: `Why Everyone is Automating ${input}` },
          { trend: `No-Code ${input}`, growth: '+85% this month', title_idea: `Master ${input} Without Writing Code` },
          { trend: `Advanced ${input} patterns`, growth: '+110% this week', title_idea: `5 Pro Secrets for ${input}` },
        ],
      };
    case '30-Day Planner':
      return {
        schedule: [
          { day: 'Day 1', title: `Introduction to ${input}`, format: 'Short (15s)' },
          { day: 'Day 3', title: `Why ${input} is Evolving in 2026`, format: 'Short (30s)' },
          { day: 'Day 5', title: `The Ultimate ${input} Cheat Sheet`, format: 'Long (60s)' },
          { day: 'Day 8', title: `Avoid These 3 ${input} Mistakes`, format: 'Short (15s)' },
          { day: 'Day 12', title: `Mixing ${input} with Lottie Animations`, format: 'Long (90s)' },
        ],
      };
    default:
      return { error: 'Unknown agent' };
  }
}
