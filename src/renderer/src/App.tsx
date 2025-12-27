import { useUsage } from '@/hooks/useUsage'
import { RefreshButton } from '@/components/RefreshButton'
import { UsageStat } from '@/components/UsageStat'
import { Separator } from '@/components/ui/separator'
import { BorderBeam } from '@/components/ui/border-beam'
import { StripedPattern } from '@/components/ui/striped-pattern'

export default function App() {
  const { data, isRefreshing, refresh } = useUsage()

  return (
    <div className="relative flex items-center gap-2 px-2 py-0.5 bg-card border border-border rounded-full [-webkit-app-region:drag] overflow-hidden">
      <StripedPattern className="!z-0 text-white/10 [mask-image:linear-gradient(90deg,transparent,white_20%,white_80%,transparent)]" />
      {isRefreshing && (
        <BorderBeam
          size={40}
          duration={1.5}
          colorFrom="#f59e0b"
          colorTo="#fbbf24"
        />
      )}
      <RefreshButton isRefreshing={isRefreshing} onClick={refresh} />

      {data?.error ? (
        <span className="text-xs text-muted-foreground">
          {data.error}
        </span>
      ) : (
        <>
          <UsageStat
            label="5h"
            value={data?.five_hour?.utilization}
            resetTime={data?.five_hour?.resets_at}
          />
          <Separator orientation="vertical" className="h-4" />
          <UsageStat
            label="7d"
            value={data?.seven_day?.utilization}
            resetTime={data?.seven_day?.resets_at}
          />
          <Separator orientation="vertical" className="h-4" />
          <UsageStat
            label="7d Sonnet"
            value={data?.seven_day_sonnet?.utilization}
          />
        </>
      )}
    </div>
  )
}
