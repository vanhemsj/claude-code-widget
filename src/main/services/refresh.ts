import { powerMonitor } from 'electron'
import { REFRESH_INTERVALS } from '../../shared/constants'
import * as config from './config'

let intervalId: ReturnType<typeof setInterval> | null = null
let intervalMs = REFRESH_INTERVALS.NORMAL
let refreshCallback: (() => void) | null = null
let wasRunning = false

export function initialize(): void {
  intervalMs = config.get('refreshInterval') ?? REFRESH_INTERVALS.NORMAL

  powerMonitor.on('suspend', () => {
    wasRunning = intervalId !== null
    if (wasRunning) stop()
  })

  powerMonitor.on('resume', () => {
    if (wasRunning) {
      start()
      refreshCallback?.()
    }
  })
}

export function start(): void {
  stop()
  if (refreshCallback) {
    intervalId = setInterval(refreshCallback, intervalMs)
  }
}

export function stop(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function setRefreshInterval(ms: number): void {
  intervalMs = ms
  config.set('refreshInterval', ms)
  if (intervalId) start()
}

export function getInterval(): number {
  return intervalMs
}

export function onRefresh(callback: () => void): void {
  refreshCallback = callback
}
