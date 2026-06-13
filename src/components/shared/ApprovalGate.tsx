'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformBadge } from './PlatformBadge'
import { AlertTriangle, Check } from 'lucide-react'

interface ApprovalGateProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  platform: string
  caption?: string
  hashtags?: string[]
  scheduleTime?: string
  isImmediate?: boolean
  isLoading?: boolean
}

export function ApprovalGate({
  open,
  onClose,
  onConfirm,
  platform,
  caption,
  hashtags,
  scheduleTime,
  isImmediate = false,
  isLoading = false,
}: ApprovalGateProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-border-DEFAULT max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent-fifa" />
            Confirm Publication
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Publishing to</span>
            <PlatformBadge platform={platform} />
          </div>

          {caption && (
            <div className="bg-bg-surface3 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Caption Preview</p>
              <p className="text-sm line-clamp-4">{caption}</p>
            </div>
          )}

          {hashtags && hashtags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-1">
                {hashtags.slice(0, 10).map(tag => (
                  <Badge key={tag} variant="outline" className="text-[10px] bg-transparent">
                    {tag}
                  </Badge>
                ))}
                {hashtags.length > 10 && (
                  <Badge variant="outline" className="text-[10px] bg-transparent">
                    +{hashtags.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="bg-bg-surface3 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Timing</p>
            <p className="text-sm font-medium">
              {isImmediate ? 'Immediate posting' : `Scheduled for ${scheduleTime}`}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-accent-ai hover:bg-accent-ai/90 text-black gap-1.5"
            >
              <Check size={14} />
              {isLoading ? 'Publishing...' : 'Confirm & Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
