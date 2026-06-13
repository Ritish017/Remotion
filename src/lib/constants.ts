export const MODELS = [
  { id: 'claude-opus-4-8',   label: 'Claude Opus 4.8',   inputCost: 5.00,  outputCost: 25.00, perVideo: 0.0002  },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', inputCost: 3.00,  outputCost: 15.00, perVideo: 0.0001  },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  inputCost: 1.00,  outputCost: 5.00,  perVideo: 0.00005 },
  { id: 'nova-micro',        label: 'Nova Micro',         inputCost: 0.07,  outputCost: 0.35,  perVideo: 0.00001 },
  { id: 'nova-pro',          label: 'Nova Pro',           inputCost: 0.80,  outputCost: 3.20,  perVideo: 0.00008 },
  { id: 'nova-lite',         label: 'Nova Lite',          inputCost: 0.30,  outputCost: 1.20,  perVideo: 0.00003 },
]

export const VERTICALS = [
  { id: 'social',   label: 'Social Branding',  accent: '#f0522a', route: '/social'      },
  { id: 'ai',       label: 'AI Teaching',       accent: '#00c9a7', route: '/ai-teaching' },
  { id: 'football', label: 'Football / FIFA',   accent: '#f5c518', route: '/football'    },
]

export const PLATFORMS = ['youtube', 'reels', 'tiktok', 'shorts']

export const PALETTES = [
  'tutorial-neon', 'tutorial-warm', 'ai-electric', 'ai-cyber', 'ai-fire',
  'fifa-gold', 'fifa-red', 'fifa-cool', 'neon-purple', 'dark-bold'
]
