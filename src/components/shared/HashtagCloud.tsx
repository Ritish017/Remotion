'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface HashtagCloudProps {
  hashtags: { tag: string; hot: boolean }[]
  accent: string
}

export function HashtagCloud({ hashtags, accent }: HashtagCloudProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopied(tag)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <Card className="rounded-xl border-border-DEFAULT bg-bg-surface overflow-hidden col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-bold">Trending Hashtags — Instagram + TikTok</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
      </CardHeader>
      <CardContent>
        {hashtags.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground font-mono">
            No hashtags generated yet
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {hashtags.map(({ tag, hot }) => (
              <Badge
                key={tag}
                variant="outline"
                className={`cursor-pointer px-3 py-1.5 transition-all text-xs font-mono font-medium ${
                  hot 
                    ? 'bg-opacity-10 border-opacity-50 hover:bg-opacity-20' 
                    : 'border-border-strong text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
                style={hot ? {
                  color: accent,
                  borderColor: accent,
                  backgroundColor: `${accent}15`
                } : {}}
                onClick={() => handleCopy(tag)}
              >
                {copied === tag ? (
                  <span className="flex items-center gap-1"><Check size={12} /> Copied</span>
                ) : tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
