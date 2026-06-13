'use client'

import { useState } from 'react'
import { Settings, Key, Globe, Palette, Save, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const envVars = [
    {
      section: 'AI',
      color: '#00c9a7',
      fields: [
        { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', placeholder: 'sk-ant-...', type: 'password' },
      ]
    },
    {
      section: 'Database',
      color: '#6c47ff',
      fields: [
        { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxx.supabase.co', type: 'text' },
        { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', placeholder: 'eyJ...', type: 'password' },
      ]
    },
    {
      section: 'Social Posting',
      color: '#f0522a',
      fields: [
        { key: 'AYRSHARE_API_KEY', label: 'Ayrshare API Key', placeholder: 'API key from ayrshare.com', type: 'password' },
      ]
    },
    {
      section: 'Research',
      color: '#f5c518',
      fields: [
        { key: 'YOUTUBE_API_KEY', label: 'YouTube Data API v3 Key', placeholder: 'AIza...', type: 'password' },
      ]
    },
    {
      section: 'CATALYST Backend',
      color: '#8b5cf6',
      fields: [
        { key: 'NEXT_PUBLIC_CATALYST_URL', label: 'CATALYST API URL', placeholder: 'http://127.0.0.1:8000', type: 'text' },
      ]
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings size={24} className="text-muted-foreground" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your API keys and preferences</p>
      </div>

      <Card className="bg-bg-surface border-border-DEFAULT">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Key size={16} className="text-accent-fifa mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Environment Variables</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                These settings live in your <code className="font-mono bg-bg-surface3 px-1 rounded">.env</code> file.
                Edit it directly in your project root to persist changes across restarts.
                Showing configuration guide below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {envVars.map(section => (
        <Card key={section.section} className="bg-bg-surface border-border-DEFAULT overflow-hidden">
          <div className="h-0.5" style={{ background: section.color }} />
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: section.color }}>
              <span className="w-2 h-2 rounded-full" style={{ background: section.color }} />
              {section.section}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {section.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs">
                  {field.label}
                  <code className="font-mono text-muted-foreground ml-2 text-[10px]">{field.key}</code>
                </Label>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="bg-bg-surface2 border-border-DEFAULT font-mono text-sm"
                  disabled
                  defaultValue={field.type === 'text' ? '' : ''}
                />
                <p className="text-[11px] text-muted-foreground">
                  Set in <code className="font-mono">.env</code>: <code className="font-mono">{field.key}=your_value_here</code>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Quick setup guide */}
      <Card className="bg-bg-surface border-border-DEFAULT">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe size={14} />
            Quick Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong className="text-foreground">Supabase</strong> — Create a free project at{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-accent-brand hover:underline">supabase.com</a>,
              copy URL + anon key, run <code className="font-mono bg-bg-surface3 px-1 rounded text-xs">supabase/schema.sql</code> in the SQL editor
            </li>
            <li>
              <strong className="text-foreground">Anthropic</strong> — Get key at{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-accent-brand hover:underline">console.anthropic.com</a>
            </li>
            <li>
              <strong className="text-foreground">Ayrshare</strong> — Sign up at{' '}
              <a href="https://ayrshare.com" target="_blank" rel="noreferrer" className="text-accent-brand hover:underline">ayrshare.com</a>{' '}
              and connect your social accounts, then get the API key
            </li>
            <li>
              <strong className="text-foreground">YouTube Data API</strong> — Enable in{' '}
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-accent-brand hover:underline">Google Cloud Console</a>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
