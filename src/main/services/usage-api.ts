import { app, net } from 'electron'
import { API_CONFIG } from '../../shared/constants'
import { getAccessToken } from './credentials'
import type { UsageData } from '../../shared/types'

let cachedData: UsageData | null = null

export async function fetchUsage(): Promise<UsageData> {
  let token: string | null
  try {
    token = getAccessToken()
  } catch (error) {
    if ((error as Error).message === 'Token expired') {
      cachedData = { error: 'Token expired, run the Claude CLI to refresh the token' }
      return cachedData
    }
    cachedData = { error: 'Error getting token' }
    return cachedData
  }

  if (!token) {
    cachedData = { error: 'No token found' }
    return cachedData
  }

  try {
    const response = await net.fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.USAGE_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'anthropic-beta': API_CONFIG.BETA_HEADER,
        'User-Agent': `claude-usage-widget/${app.getVersion()}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
    }

    cachedData = await response.json() as UsageData
    return cachedData
  } catch (error) {
    console.error('UsageApiService: Failed to fetch:', (error as Error).message)
    cachedData = { error: (error as Error).message }
    return cachedData
  }
}

export function getCachedData(): UsageData | null {
  return cachedData
}
