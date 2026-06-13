'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Library, BarChart3, Settings, LayoutDashboard, Zap, Brain, Trophy, Bot, Wand2 } from 'lucide-react'
import { MODELS } from '@/lib/constants'
import { getJobs } from '@/lib/api'
import { mapModelNameToId } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const [jobsData, setJobsData] = useState<any[]>([])

  useEffect(() => {
    const fetchJobs = () => {
      getJobs()
        .then(data => setJobsData(Array.isArray(data?.jobs) ? data.jobs : []))
        .catch(err => console.error('Sidebar failed to fetch jobs:', err))
    }
    fetchJobs()
    const interval = setInterval(fetchJobs, 10000)
    return () => clearInterval(interval)
  }, [])

  const totalCost = jobsData.reduce((acc, j) => {
    const modelId = mapModelNameToId(j.model)
    const modelData = MODELS.find(m => m.id === modelId)
    return acc + (modelData ? modelData.perVideo : 0.0001)
  }, 0)

  const contentOsNav = [
    { name: 'Campaigns', href: '/campaigns', icon: Layers, accent: '#6c47ff' },
    { name: 'Library', href: '/library', icon: Library, accent: '#8b5cf6' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, accent: '#00c9a7' },
    { name: 'Settings', href: '/settings', icon: Settings, accent: '#71717a' },
  ]

  const legacyNav = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard, accent: '#6c47ff' },
    { name: 'Social', href: '/social', icon: Zap, accent: '#f0522a' },
    { name: 'AI Teaching', href: '/ai-teaching', icon: Brain, accent: '#00c9a7' },
    { name: 'Football', href: '/football', icon: Trophy, accent: '#f5c518' },
    { name: 'Agents', href: '/agents', icon: Bot, accent: '#6c47ff' },
    { name: 'Generate', href: '/generate', icon: Wand2, accent: '#6c47ff' },
  ]

  const renderNavItem = (item: typeof contentOsNav[0]) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    const Icon = item.icon
    return (
      <Link
        key={item.name}
        href={item.href}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative overflow-hidden"
        style={isActive ? { color: item.accent, backgroundColor: `${item.accent}15` } : {}}
      >
        <Icon size={18} className={isActive ? '' : 'text-muted-foreground group-hover:text-foreground transition-colors'} style={isActive ? { color: item.accent } : {}} />
        <span className={`text-sm font-medium hidden xl:block ${isActive ? '' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
          {item.name}
        </span>
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-[52px] bottom-0 w-[60px] xl:w-[220px] bg-bg-surface border-r border-border-DEFAULT flex flex-col transition-all duration-300 z-40">
      <nav className="flex-1 overflow-y-auto py-4 px-2 xl:px-4 space-y-1">
        <div className="hidden xl:block px-3 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">Content OS</span>
        </div>
        {contentOsNav.map(renderNavItem)}

        <div className="my-4 border-t border-border-DEFAULT" />

        <div className="hidden xl:block px-3 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">Studio</span>
        </div>
        {legacyNav.map(renderNavItem)}
      </nav>

      <div className="p-4 border-t border-border-DEFAULT hidden xl:block">
        <div className="font-mono text-[11px] text-muted-foreground flex flex-col gap-1">
          <span>{jobsData.length} {jobsData.length === 1 ? 'video' : 'videos'} · ${totalCost.toFixed(4)} spent</span>
          <span className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-ai animate-pulse"></span>
            System Online
          </span>
        </div>
      </div>
    </aside>
  )
}
