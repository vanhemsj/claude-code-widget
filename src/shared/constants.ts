export const REFRESH_INTERVALS = {
  FAST: 10000,
  NORMAL: 30000,
  SLOW: 60000
} as const

export const WINDOW_DIMENSIONS = {
  FLOATING: { WIDTH: 400, HEIGHT: 36 }
} as const

export const API_CONFIG = {
  BASE_URL: 'https://api.anthropic.com',
  USAGE_ENDPOINT: '/api/oauth/usage',
  BETA_HEADER: 'oauth-2025-04-20'
} as const

export const IPC_CHANNELS = {
  GET_USAGE: 'get-usage',
  REFRESH_USAGE: 'refresh-usage',
  USAGE_DATA: 'usage-data',
  REFRESH_START: 'refresh-start'
} as const
