'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyButton({ text, label = 'Copy', size = 'sm' }: { text: string; label?: string; size?: 'sm' | 'default' | 'lg' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleCopy}
      className="gap-1.5 border-border-strong text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check size={14} className="text-accent-ai" />
          <span className="text-accent-ai">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          {label}
        </>
      )}
    </Button>
  )
}
