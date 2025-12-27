export interface UsageMetric {
  utilization: number | null
  resets_at?: string
}

export interface UsageData {
  five_hour?: UsageMetric
  seven_day?: UsageMetric
  seven_day_sonnet?: UsageMetric
  error?: string
}

export interface WindowPosition {
  x: number
  y: number
}

export interface ElectronAPI {
  getUsage: () => Promise<UsageData | null>
  refreshUsage: () => Promise<UsageData>
  onUsageData: (callback: (data: UsageData) => void) => void
  onRefreshStart: (callback: () => void) => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
