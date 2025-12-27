import { useState, useEffect, useCallback } from 'react'
import type { UsageData } from '../../../shared/types'

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    window.api.getUsage().then((initialData) => {
      if (initialData) setData(initialData)
    }).catch((err) => {
      console.error('Failed to get usage:', err)
    })

    window.api.onUsageData((newData) => {
      setData(newData)
      setIsRefreshing(false)
    })

    window.api.onRefreshStart(() => {
      setIsRefreshing(true)
    })
  }, [])

  const refresh = useCallback(() => {
    if (!isRefreshing) {
      window.api.refreshUsage()
    }
  }, [isRefreshing])

  return { data, isRefreshing, refresh }
}
