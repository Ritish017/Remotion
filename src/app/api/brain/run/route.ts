import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BRAIN_SYSTEM_PROMPT = `You are the Campaign Brain for CATALYST Content OS.

You are an autonomous AI content strategist. Every morning you wake up, look at the
real world, and decide what video content to create today for a specific campaign.

UNIVERSAL REASONING RULES:
1. TIMELINESS FIRST — What is happening TODAY matters more than evergreen content
2. SPECIFICITY — Name real things: real matches, real model releases, real events
3. NO REPETITION — Check episode history, never repeat a topic
4. PERFORMANCE AWARENESS — Lean into what's working, away from what isn't
5. PLATFORM FIT — Instagram wants reactive punchy content, YouTube wants depth
6. CAMPAIGN PHASE — Early (educate), Mid (grow), Late (convert/retain)
7. AUDIENCE RESPECT — Never talk down, always add genuine value

CONTENT DECISION LOGIC:
- If LIVE EVENT exists today → make it the primary episode
- If BREAKING NEWS in your domain → reactive episode + evergreen context piece
- If TRENDING TOPIC matches campaign → ride the wave with your unique angle
- If nothing special today → pick the highest-value evergreen topic not yet covered
- If audience loved something → do a follow-up or deeper dive
- If approaching campaign end → tie threads together, drive conversion

OUTPUT — return valid JSON only, no markdown:
{
  "reasoning": "2-3 sentences: what you saw, what you decided, why",
  "confidence": 0-100,
  "today_theme": "One sentence: what today's content is about",
  "skip_today": false,
  "skip_reason": null,
  "episodes": [
    {
      "title": "Specific compelling title",
      "episode_type": "preview|reaction|tutorial|explainer|roundup|breaking|analysis|prediction",
      "hook": "Opening line that grabs attention in first 3 words",
      "topic_depth": "Exactly what to cover",
      "key_facts": ["concrete fact", "another fact"],
      "unique_angle": "What makes this shareable",
      "urgency": "breaking|high|normal|low",
      "post_timing": "now|in_2_hours|at_08:00|at_18:00",
      "platform_strategy": {
        "instagram": {"post": true, "angle": "...", "format": "reel|story"},
        "youtube": {"post": true, "angle": "...", "format": "short|long"},
        "x": {"post": true, "angle": "...", "format": "tweet|thread"},
        "linkedin": {"post": false, "reason": "not relevant"}
      },
      "research_queries": ["exact search string 1", "exact search string 2"],
      "hashtags": ["#Specific", "#Hashtags"],
      "catalyst_style": "tutorial-teaching|ai-social|fifa-sports|saas-kinetic",
      "veo_background_prompt": "Describe the 8s background clip for Veo to generate",
      "script_direction": "Direction for the Script Agent — tone, key points, structure"
    }
  ],
  "tomorrow_preview": "What you expect tomorrow will be about"
}`

async function fetchWorldContext(campaign: any): Promise<any> {
  const today = new Date().toISOString().split('T')[0]
  const campaignType = campaign.type

  if (campaignType === 'football') {
    return fetchFootballContext(today)
  } else if (campaignType === 'ai-teaching') {
    return fetchAITeachingContext(campaign, today)
  } else if (campaignType === 'social-branding') {
    return fetchSocialBrandingContext(campaign, today)
  }
  return { date: today, campaign_type: campaignType, primary_events: [], trending_topics: [], opportunities: [], context_summary: 'Generic context — no specific live data available.' }
}

async function fetchFootballContext(today: string): Promise<any> {
  const key = process.env.FOOTBALL_API_KEY || ''
  const headers = { 'x-rapidapi-host': 'v3.football.api-sports.io', 'x-rapidapi-key': key }
  const base = 'https://v3.football.api-sports.io'

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().split('T')[0]

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tStr = tomorrow.toISOString().split('T')[0]

  async function getFix(params: Record<string, string>) {
    try {
      const qs = new URLSearchParams({ league: '1', season: '2026', ...params })
      const r = await fetch(`${base}/fixtures?${qs}`, { headers })
      return r.json()
    } catch { return {} }
  }

  const [todayFx, yesterdayFx, liveFx] = await Promise.all([
    getFix({ date: today }),
    getFix({ date: yStr }),
    getFix({ live: 'all' })
  ])

  const parse = (data: any) => (data?.response || []).map((f: any) => ({
    fixture_id: f.fixture.id,
    time: f.fixture.date.slice(11, 16) + ' UTC',
    status: f.fixture.status.short,
    home_team: f.teams.home.name,
    away_team: f.teams.away.name,
    home_goals: f.goals.home,
    away_goals: f.goals.away,
    minute: f.fixture.status.elapsed,
    round: f.league.round
  }))

  const today_matches = parse(todayFx)
  const yesterday_results = parse(yesterdayFx)
  const live_now = parse(liveFx)

  const d = new Date(today)
  let stage = 'group_stage'
  if (d <= new Date('2026-06-27')) stage = 'group_stage'
  else if (d <= new Date('2026-07-03')) stage = 'round_of_32'
  else if (d <= new Date('2026-07-07')) stage = 'round_of_16'
  else if (d <= new Date('2026-07-11')) stage = 'quarterfinals'
  else if (d <= new Date('2026-07-15')) stage = 'semifinals'
  else stage = 'final'

  const primary_events = [
    ...live_now.map((m: any) => ({ type: 'live_match', priority: 'breaking', description: `LIVE: ${m.home_team} ${m.home_goals}-${m.away_goals} ${m.away_team} (min ${m.minute})`, data: m })),
    ...today_matches.map((m: any) => ({ type: 'upcoming_match', priority: 'high', description: `TODAY: ${m.home_team} vs ${m.away_team} at ${m.time}`, data: m })),
    ...yesterday_results.filter((m: any) => ['FT','AET','PEN'].includes(m.status)).map((m: any) => ({ type: 'recent_result', priority: 'normal', description: `RESULT: ${m.home_team} ${m.home_goals}-${m.away_goals} ${m.away_team}`, data: m }))
  ]

  const days_to_final = Math.ceil((new Date('2026-07-19').getTime() - new Date(today).getTime()) / 86400000)

  return {
    date: today, campaign_type: 'football', tournament: 'FIFA World Cup 2026',
    tournament_stage: stage, days_to_final,
    primary_events, today_matches, yesterday_results, live_now,
    trending_topics: today_matches.map((m: any) => `${m.home_team} vs ${m.away_team}`),
    opportunities: [
      ...(today_matches.length ? [`Pre-match preview: ${today_matches.length} matches today`] : []),
      ...(yesterday_results.length ? [`Post-match reaction: ${yesterday_results.length} results from yesterday`] : []),
      ...(['quarterfinals','semifinals','final'].includes(stage) ? [`High-stakes ${stage} — maximum audience interest`] : [])
    ],
    context_summary: `${live_now.length ? `${live_now.length} match(es) live. ` : ''}${today_matches.length ? `${today_matches.length} match(es) today. ` : ''}${yesterday_results.length ? `${yesterday_results.length} results from yesterday. ` : ''}Tournament stage: ${stage.replace(/_/g, ' ')}.`
  }
}

async function fetchAITeachingContext(campaign: any, today: string): Promise<any> {
  const ytKey = process.env.YOUTUBE_API_KEY || ''
  const topic = campaign.topic || 'artificial intelligence'

  async function ytSearch(q: string, order = 'relevance') {
    try {
      const qs = new URLSearchParams({ key: ytKey, q, type: 'video', order, maxResults: '6', part: 'snippet' })
      const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${qs}`)
      return r.json()
    } catch { return {} }
  }

  const [recent, topicVideos] = await Promise.all([
    ytSearch('AI tutorial 2026 new', 'date'),
    ytSearch(`${topic} tutorial`, 'relevance')
  ])

  const parse = (data: any) => (data?.items || []).map((item: any) => ({
    title: item.snippet?.title || '',
    channel: item.snippet?.channelTitle || '',
    published: item.snippet?.publishedAt?.slice(0, 10) || ''
  }))

  const recentVideos = parse(recent)
  const topicVids = parse(topicVideos)

  const primary_events = recentVideos.slice(0, 3)
    .filter((v: any) => /released|launches|new|just dropped|announces/i.test(v.title))
    .map((v: any) => ({ type: 'ai_release_or_news', priority: 'high', description: `Recent: ${v.title}`, data: v }))

  return {
    date: today, campaign_type: 'ai-teaching',
    primary_events,
    recent_ai_videos: recentVideos.slice(0, 5),
    topic_specific_videos: topicVids.slice(0, 5),
    trending_topics: [...recentVideos.slice(0, 3).map((v: any) => v.title), ...topicVids.slice(0, 2).map((v: any) => v.title)],
    opportunities: primary_events.length ? [`Breaking AI news: ${primary_events[0].description}`] : [`Create content about trending topic: ${topic}`],
    context_summary: `${primary_events.length ? `Breaking: ${primary_events[0].description.slice(0, 80)}. ` : ''}${recentVideos.length ? `Recent viral AI video: '${recentVideos[0].title.slice(0, 60)}'. ` : ''}Focus topic: ${topic}.`
  }
}

async function fetchSocialBrandingContext(campaign: any, today: string): Promise<any> {
  const ytKey = process.env.YOUTUBE_API_KEY || ''
  const topic = campaign.topic || 'productivity'

  async function ytSearch(q: string) {
    try {
      const qs = new URLSearchParams({ key: ytKey, q, type: 'video', order: 'viewCount', maxResults: '6', part: 'snippet' })
      const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${qs}`)
      return r.json()
    } catch { return {} }
  }

  const [shorts, viral] = await Promise.all([
    ytSearch(`${topic} shorts viral 2026`),
    ytSearch(`${topic} reels tips`)
  ])

  const parse = (data: any) => (data?.items || []).map((item: any) => ({ title: item.snippet?.title || '' }))
  const allVideos = [...parse(shorts), ...parse(viral)]

  const VIRAL_FORMATS = ["POV: You discovered", "Nobody talks about", "You're doing", "The truth about", "Stop doing", "This changed everything", "I tested", "The secret"]
  const trending_formats = VIRAL_FORMATS.filter(fmt => allVideos.some((v: any) => v.title.toLowerCase().includes(fmt.split(' ')[1]?.toLowerCase() || '')))

  return {
    date: today, campaign_type: 'social-branding',
    primary_events: [],
    trending_topics: allVideos.slice(0, 5).map((v: any) => v.title.slice(0, 60)),
    trending_formats: trending_formats.length ? trending_formats : VIRAL_FORMATS.slice(0, 3),
    viral_hooks: allVideos.filter((v: any) => /why|how|stop|never|always|\?/i.test(v.title)).slice(0, 5).map((v: any) => v.title.slice(0, 60)),
    opportunities: trending_formats.slice(0, 3).map(f => `Use viral format: '${f}'`),
    context_summary: `Social content today. Top format signals: ${trending_formats.slice(0, 2).join(', ') || 'evergreen hooks'}. Recent viral: '${allVideos[0]?.title?.slice(0, 60) || 'none'}'.`
  }
}

async function getPerformanceInsights(campaignId: string) {
  const { data } = await supabase
    .from('episodes')
    .select('title, episode_type, virality_score')
    .eq('campaign_id', campaignId)
    .eq('status', 'analysed')
    .order('virality_score', { ascending: false })
    .limit(20)

  if (!data?.length) return { message: 'No analysed episodes yet' }

  const scores = data.filter(e => e.virality_score).map(e => e.virality_score as number)
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  return {
    episodes_analysed: data.length,
    average_virality_score: Math.round(avg * 10) / 10,
    top_performing: data.slice(0, 3).map(e => ({ title: e.title, score: e.virality_score })),
  }
}

async function getBrainMemory(campaignId: string) {
  const { data } = await supabase.from('brain_memory').select('*').eq('campaign_id', campaignId).single()
  return data || {}
}

async function getEpisodeHistory(campaignId: string) {
  const { data } = await supabase
    .from('episodes')
    .select('title, topic, scheduled_date, episode_type')
    .eq('campaign_id', campaignId)
    .order('scheduled_date', { ascending: false })
    .limit(15)
  return data || []
}

async function createEpisodeFromSpec(campaignId: string, spec: any, worldContext: any) {
  const { data: last } = await supabase
    .from('episodes')
    .select('episode_number')
    .eq('campaign_id', campaignId)
    .order('episode_number', { ascending: false })
    .limit(1)
    .single()

  const nextNum = (last?.episode_number || 0) + 1

  const { data } = await supabase.from('episodes').insert({
    campaign_id: campaignId,
    episode_number: nextNum,
    title: spec.title,
    topic: spec.topic_depth || spec.title,
    status: 'idea',
    scheduled_date: new Date().toISOString().split('T')[0],
    episode_type: spec.episode_type || 'standard',
    urgency: spec.urgency || 'normal',
    auto_triggered: true,
    world_context_used: worldContext,
    brain_reasoning: spec.script_direction,
    research: {
      hook: spec.hook,
      key_facts: spec.key_facts || [],
      unique_angle: spec.unique_angle,
      platform_strategy: spec.platform_strategy || {},
      research_queries: spec.research_queries || [],
      hashtags: spec.hashtags || [],
      catalyst_style: spec.catalyst_style,
      veo_background_prompt: spec.veo_background_prompt,
      post_timing: spec.post_timing || 'now',
    }
  }).select().single()

  return data
}

async function saveBrainMemory(campaignId: string, decision: any) {
  const existing = await getBrainMemory(campaignId)
  const topicsCovered = [...(existing.topics_covered || [])]

  for (const ep of decision.episodes || []) {
    const topic = ep.title || ep.topic_depth
    if (topic && !topicsCovered.includes(topic)) topicsCovered.push(topic)
  }

  const decisionHistory = [...(existing.decision_history || [])]
  decisionHistory.push({
    date: new Date().toISOString().split('T')[0],
    theme: decision.today_theme,
    confidence: decision.confidence,
    episodes_count: (decision.episodes || []).length
  })

  await supabase.from('brain_memory').upsert({
    campaign_id: campaignId,
    topics_covered: topicsCovered,
    decision_history: decisionHistory.slice(-30),
    updated_at: new Date().toISOString()
  })
}

export async function POST(req: NextRequest) {
  try {
    const { campaignId } = await req.json()
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

    const { data: campaign, error: campErr } = await supabase
      .from('campaigns').select('*').eq('id', campaignId).single()
    if (campErr || !campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const today = new Date().toISOString().split('T')[0]
    const start = campaign.start_date ? new Date(campaign.start_date) : new Date()
    const daysIn = Math.max(1, Math.ceil((new Date(today).getTime() - start.getTime()) / 86400000) + 1)
    const totalDays = campaign.duration_days || 30
    const phase = daysIn <= 7 ? 'early' : daysIn <= 21 ? 'mid' : 'late'

    const [worldContext, performance, memory, history] = await Promise.all([
      fetchWorldContext(campaign),
      getPerformanceInsights(campaignId),
      getBrainMemory(campaignId),
      getEpisodeHistory(campaignId)
    ])

    const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const userPrompt = `
CAMPAIGN:
  Name: ${campaign.name}
  Type: ${campaign.type}
  Voice: ${campaign.brand_voice || 'Energetic and engaging'}
  Audience: ${campaign.target_audience || 'General audience'}
  Platforms: ${(campaign.target_platforms || []).join(', ')}
  Day ${daysIn} of ${totalDays} | Phase: ${phase}
  Start: ${campaign.start_date || 'N/A'} | Today: ${today}

LIVE WORLD CONTEXT (fetched right now):
${JSON.stringify(worldContext, null, 2)}

WHAT HAS WORKED SO FAR (performance data):
${JSON.stringify(performance, null, 2)}

BRAIN MEMORY (what I have learned about this campaign):
${JSON.stringify(memory, null, 2)}

EPISODE HISTORY (DO NOT REPEAT THESE TOPICS):
${JSON.stringify(history.map(ep => ({ title: ep.title, date: ep.scheduled_date, type: ep.episode_type })), null, 2)}

---
Today is ${todayFormatted}.
Reason through all of the above and decide what content to create today.
Be specific. Use the real data in the context. Return JSON only.`

    const command = new ConverseCommand({
      modelId: 'amazon.nova-pro-v1:0',
      system: [{ text: BRAIN_SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: userPrompt }] }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.3 }
    })

    const response = await bedrock.send(command)
    let text = response.output?.message?.content?.[0]?.text || ''
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    let decision: any
    try {
      decision = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Brain parse failed', raw: text }, { status: 500 })
    }

    const episodesCreated: any[] = []
    if (!decision.skip_today) {
      for (const spec of decision.episodes || []) {
        const ep = await createEpisodeFromSpec(campaignId, spec, worldContext)
        if (ep) episodesCreated.push(ep)
      }
    }

    await saveBrainMemory(campaignId, decision)

    await supabase.from('brain_runs').insert({
      campaign_id: campaignId,
      run_date: today,
      reasoning: decision.reasoning,
      confidence: decision.confidence || 0,
      today_theme: decision.today_theme,
      episodes_created: episodesCreated.length,
      world_context: worldContext,
      full_decision: decision
    })

    return NextResponse.json({
      campaign_id: campaignId,
      date: today,
      campaign_type: campaign.type,
      decision,
      world_context: worldContext,
      episodes_created: episodesCreated.length,
      episode_ids: episodesCreated.map(e => e.id)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Brain run failed' }, { status: 500 })
  }
}
