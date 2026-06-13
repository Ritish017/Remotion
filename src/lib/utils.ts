import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MODELS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapModelNameToId(modelName?: string): string {
  if (!modelName) return "nova-micro"
  const name = modelName.toLowerCase()
  if (name.includes("opus")) return "claude-opus-4-8"
  if (name.includes("sonnet")) return "claude-sonnet-4-6"
  if (name.includes("haiku")) return "claude-haiku-4-5"
  if (name.includes("micro")) return "nova-micro"
  if (name.includes("pro") || name.includes("qwen") || name.includes("mistral") || name.includes("deepseek")) return "nova-pro"
  if (name.includes("lite")) return "nova-lite"
  if (name.includes("assembler")) return "nova-micro"
  return "nova-micro"
}

export function getJobPerformanceMetrics(jobId: string) {
  let hash = 0
  for (let i = 0; i < jobId.length; i++) {
    hash = (hash << 5) - hash + jobId.charCodeAt(i)
    hash |= 0
  }
  const absHash = Math.abs(hash)
  
  const views = (absHash % 490) * 1000 + 10000 // 10k - 500k
  const ctr = parseFloat(((absHash % 80) / 10 + 4).toFixed(1)) // 4.0 - 12.0%
  const virality = (absHash % 50) + 50 // 50 - 100
  
  return { views, ctr, virality }
}

export function mapJobToPipelineItem(job: any) {
  let topic = job.prompt || "Untitled Video"
  if (topic.includes("\n")) {
    const firstLine = topic.split("\n")[0]
    topic = firstLine
      .replace(/^(Tutorial video|Short-form AI social video for \w+|FIFA World Cup 2026 match preview):\s*/i, "")
      .trim()
  }

  let statusPercent = 0
  if (job.status === "queued") statusPercent = 15
  else if (job.status === "rendering") statusPercent = 50
  else if (job.status === "done") statusPercent = 100
  else if (job.status === "error") statusPercent = 0

  const dateObj = new Date(job.created_at)
  let day = "Recent"
  if (!isNaN(dateObj.getTime())) {
    day = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

  const modelId = mapModelNameToId(job.model)
  const modelData = MODELS.find(m => m.id === modelId)
  const cost = modelData ? `$${modelData.perVideo.toFixed(5)}` : "$0.00000"

  return {
    topic,
    day,
    status: statusPercent,
    model: modelId,
    cost
  }
}

