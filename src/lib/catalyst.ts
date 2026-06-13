import type { TutorialRequest, SocialRequest, SportsRequest } from './types'

const CATALYST_URL = process.env.NEXT_PUBLIC_CATALYST_URL || 'http://127.0.0.1:8000'

export async function generateVideo(campaignType: string, body: TutorialRequest | SocialRequest | SportsRequest) {
  const endpoints: Record<string, string> = {
    'ai-teaching': '/generate/tutorial',
    'social-branding': '/generate/social',
    football: '/generate/sports/preview',
  }
  const endpoint = endpoints[campaignType] || '/generate/tutorial'
  const res = await fetch(`${CATALYST_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function pollJobStatus(jobId: string) {
  const res = await fetch(`${CATALYST_URL}/status/${jobId}`)
  return res.json()
}

export function getPreviewUrl(jobId: string) {
  return `${CATALYST_URL}/preview/${jobId}`
}

export function getDownloadUrl(jobId: string) {
  return `${CATALYST_URL}/download/${jobId}`
}
