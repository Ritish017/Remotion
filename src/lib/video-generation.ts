// Shared types and utilities for Nova Reel video generation

export const PALETTE_VISUALS: Record<string, string> = {
  'tutorial-neon': 'cyberpunk neon aesthetic, electric blue and purple neon lights, dark tech background, floating digital particles',
  'tutorial-warm': 'warm educational atmosphere, soft golden amber lighting, cozy modern tech environment, warm bokeh',
  'ai-electric': 'electric energy environment, bright white and blue lightning arcs, plasma discharge, charged dark atmosphere',
  'ai-cyber': 'matrix-style digital green code cascading, circuit board abstract patterns, dark cyber grid',
  'ai-fire': 'intense fire energy aesthetic, orange and red flames, dynamic heat distortion, dark background',
  'neon-purple': 'deep purple neon glow environment, violet and magenta neon accents, dark atmospheric night aesthetic',
  'dark-bold': 'deep charcoal dark background, soft indigo accent glows, minimalist geometric surfaces, cinematic bokeh, clean professional tech aesthetic, smooth subtle light diffusion',
  'graph-tech': 'dark navy background, softly glowing graph nodes and connecting edges, network topology as dim geometric lines, subtle data flow, deep navy to black gradient',
}

export const MOTION_VISUALS: Record<string, string> = {
  'kinetic': 'fast-paced energetic camera motion, quick dynamic movement, high energy transitions',
  'smooth': 'smooth flowing cinematic camera movement, elegant fluid transitions',
  'dramatic': 'slow dramatic cinematic reveal, epic scale panning shot, powerful sweeping movement',
  'minimal': 'subtle gentle motion, calm steady camera, understated elegant movement',
}

export interface VideoSegment {
  index: number
  invocationArn: string
  textOverlay: {
    title?: string
    bullets?: string[]
    stat?: string
    type: 'hook' | 'problem' | 'solution' | 'cta' | 'generic'
  }
  prompt: string
  s3OutputUri: string
  durationSeconds: number
}

export interface VideoJob {
  jobId: string
  topic: string
  palette: string
  motionPreset: string
  segments: VideoSegment[]
  totalDuration: number
  createdAt: string
  campaignType: 'ai-teaching' | 'social-branding' | 'football'
}

export function buildTutorialSegments(
  topic: string,
  contentMap: any,
  palette: string,
  motion: string,
  requestedDuration: number
): Array<{ prompt: string; textOverlay: VideoSegment['textOverlay']; durationSeconds: number }> {
  const paletteDesc = PALETTE_VISUALS[palette] || PALETTE_VISUALS['tutorial-neon']
  const motionDesc = MOTION_VISUALS[motion] || MOTION_VISUALS['kinetic']
  const baseStyle = `${paletteDesc}, ${motionDesc}, no text, no people, abstract visualization, cinematic 4K quality`

  if (!contentMap || Object.keys(contentMap).length === 0) {
    return [{
      prompt: `Abstract educational technology background for "${topic}". ${baseStyle}.`,
      textOverlay: { title: topic, type: 'generic' },
      durationSeconds: Math.min(requestedDuration, 6),
    }]
  }

  const hook = contentMap.hook || {}
  const problem = contentMap.problem || {}
  const solution = contentMap.solution || {}
  const cta = contentMap.cta || {}

  // Build rich, concept-aware visual prompts from the actual content
  const hookVisual = hook.stat
    ? `Single glowing node pulses in darkness, then edges radiate outward forming a complete network — elegant, smooth, powerful. First moment of understanding "${topic}".`
    : `Single point of light expands into an elegant network diagram, nodes appearing in sequence, soft indigo glow, smooth cinematic push-in`

  const problemVisual = problem.bullets?.length
    ? `Network graph with severed connections, nodes flickering out one by one, data streams hitting dead ends, soft amber accent on failing nodes. Broken, stuck, limited.`
    : `Nodes disconnecting, data pathways fragmenting into dead ends, flickering lights on dark background, tension and friction visualized`

  const solutionVisual = solution.key_points?.length
    ? `State machine diagram: clear nodes connected by directed edges, data bubbles flowing smoothly between vertices, emerald glow on each completed step. Organized, clean, developer aesthetic.`
    : `Nodes snapping into perfect positions, edges forming clean directed paths, smooth data flow, emerald accent glow on connected architecture`

  const ctaVisual = `Complete graph architecture fully lit — every node glowing, every edge active, data flowing simultaneously. Slow cinematic pull-back to reveal the full picture. Triumphant, clear, inspiring.`

  const segments = [
    {
      prompt: `${hookVisual}. ${baseStyle}.`,
      textOverlay: {
        title: hook.headline,
        stat: hook.stat,
        type: 'hook' as const,
      },
      durationSeconds: 6,
    },
    {
      prompt: `${problemVisual}. ${baseStyle}.`,
      textOverlay: {
        title: problem.headline,
        bullets: problem.bullets?.slice(0, 2),
        stat: problem.stat,
        type: 'problem' as const,
      },
      durationSeconds: 6,
    },
    {
      prompt: `${solutionVisual}. ${baseStyle}.`,
      textOverlay: {
        title: solution.headline,
        bullets: solution.key_points?.slice(0, 2),
        stat: solution.stat,
        type: 'solution' as const,
      },
      durationSeconds: 6,
    },
    {
      prompt: `${ctaVisual}. ${baseStyle}.`,
      textOverlay: {
        title: cta.text,
        bullets: cta.urgency ? [cta.urgency] : undefined,
        type: 'cta' as const,
      },
      durationSeconds: 6,
    },
  ]

  return segments.filter(s => s.textOverlay.title)
}

export function buildSocialSegments(
  brief: string,
  contentMap: any,
  palette: string,
  motion: string,
): Array<{ prompt: string; textOverlay: VideoSegment['textOverlay']; durationSeconds: number }> {
  const paletteDesc = PALETTE_VISUALS[palette] || PALETTE_VISUALS['neon-purple']
  const motionDesc = MOTION_VISUALS[motion] || MOTION_VISUALS['kinetic']
  const baseStyle = `${paletteDesc}, ${motionDesc}, no text, portrait social media aesthetic, vibrant, cinematic`

  return [
    {
      prompt: `Viral social media hook background for "${brief}". Eye-catching opening visual. ${baseStyle}.`,
      textOverlay: { title: contentMap?.hook?.headline || brief, type: 'hook' },
      durationSeconds: 6,
    },
    {
      prompt: `Mid-content social media background, engaging visual flow for "${brief}". ${baseStyle}.`,
      textOverlay: { title: contentMap?.solution?.headline || 'The Solution', bullets: contentMap?.solution?.key_points?.slice(0, 2), type: 'solution' },
      durationSeconds: 6,
    },
    {
      prompt: `Closing CTA social media background, high energy conclusion. ${baseStyle}.`,
      textOverlay: { title: contentMap?.cta?.text || 'Follow for more', type: 'cta' },
      durationSeconds: 6,
    },
  ]
}

export function buildSportsSegments(
  home: string,
  away: string,
  competition: string,
  palette: string,
): Array<{ prompt: string; textOverlay: VideoSegment['textOverlay']; durationSeconds: number }> {
  const paletteDesc = PALETTE_VISUALS[palette] || PALETTE_VISUALS['ai-fire']
  const baseStyle = `${paletteDesc}, stadium atmosphere, epic sports cinematography, dynamic motion, no text, no people`

  return [
    {
      prompt: `Epic sports intro background, ${competition} matchup energy. ${baseStyle}.`,
      textOverlay: { title: `${home} vs ${away}`, bullets: [competition], type: 'hook' },
      durationSeconds: 6,
    },
    {
      prompt: `Stadium atmosphere background, crowd energy and anticipation. ${baseStyle}.`,
      textOverlay: { title: 'Match Preview', type: 'generic' },
      durationSeconds: 6,
    },
    {
      prompt: `Victory and glory sports background, championship atmosphere. ${baseStyle}.`,
      textOverlay: { title: competition, type: 'cta' },
      durationSeconds: 6,
    },
  ]
}
