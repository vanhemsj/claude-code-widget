import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UsageStatProps {
  label: string
  value: number | null | undefined
  resetTime?: string
}

function getColorClass(value: number | null | undefined): string {
  if (value == null) return 'text-green-500 bg-green-500/20'
  if (value < 50) return 'text-green-500 bg-green-500/20'
  if (value < 80) return 'text-yellow-500 bg-yellow-500/20'
  return 'text-red-500 bg-red-500/20'
}

function formatResetTime(isoString?: string): string {
  if (!isoString) return ''

  const diffMs = new Date(isoString).getTime() - Date.now()
  if (diffMs <= 0) return '0m'

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60

  return diffHours > 0 ? `${diffHours}h${remainingMins}m` : `${diffMins}m`
}

export function UsageStat({ label, value, resetTime }: UsageStatProps) {
  const displayValue = value != null ? `${value}%` : '--%'
  const reset = formatResetTime(resetTime)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <Badge variant="outline" className={cn("border-transparent","px-1","py-0","text-xs",getColorClass(value))}>
        {displayValue}
      </Badge>
      {reset && (
        <span className="text-xs text-muted-foreground">
          {reset}
        </span>
      )}
    </div>
  )
}
