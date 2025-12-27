import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  isRefreshing: boolean
  onClick: () => void
}

export function RefreshButton({ isRefreshing, onClick }: RefreshButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={isRefreshing}
      className="h-5 w-5 cursor-pointer text-amber-700 hover:bg-transparent hover:text-amber-500 [-webkit-app-region:no-drag]"
    >
      <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
    </Button>
  )
}
