import { BatchRequest, SocialRequest, SportsRequest, TutorialRequest } from './types'

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'

// Jobs
export const getJobs = () => fetch(`${BASE}/jobs`).then(r => r.ok ? r.json() : { jobs: [] }).catch(() => ({ jobs: [] }))
export const getJobStatus = (id: string) => fetch(`${BASE}/status/${id}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
export const downloadJob = (id: string) => `${BASE}/download/${id}`
export const previewJob = (id: string) => `${BASE}/preview/${id}`

// Generate
export const generateTutorial = (body: TutorialRequest) =>
  fetch(`${BASE}/generate/tutorial`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

export const generateSocial = (body: SocialRequest) =>
  fetch(`${BASE}/generate/social`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

export const generateSportsPreview = (body: SportsRequest) =>
  fetch(`${BASE}/generate/sports/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

export const generateBatch = (body: BatchRequest) =>
  fetch(`${BASE}/batch/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

// Library
export const getLibraryFamilies = () => fetch(`${BASE}/library/families`).then(r => r.ok ? r.json() : { families: [] }).catch(() => ({ families: [] }))
export const getScenes = (type?: string) => fetch(`${BASE}/scenes${type ? `?scene_type=${type}` : ''}`).then(r => r.ok ? r.json() : { scenes: [] }).catch(() => ({ scenes: [] }))

// Templates
export const getTemplates = () => fetch(`${BASE}/templates`).then(r => r.ok ? r.json() : { templates: [] }).catch(() => ({ templates: [] }))
export const importJobAsTemplate = (jobId: string) =>
  fetch(`${BASE}/templates/import-job/${jobId}`, { method: 'POST' }).then(r => r.json())

// Mix
export const mixScenes = (scenes: string[]) =>
  fetch(`${BASE}/mix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenes }) }).then(r => r.json())
