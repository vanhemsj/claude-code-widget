import path from 'path'
import { Tray, Menu, app } from 'electron'
import { REFRESH_INTERVALS } from '../../shared/constants'
import type { UsageData } from '../../shared/types'

let tray: Tray | null = null
let onRefreshCallback: (() => void) | null = null
let onResetPositionCallback: (() => void) | null = null
let onCheckUpdateCallback: (() => void) | null = null
let onIntervalChangeCallback: ((ms: number) => void) | null = null
let currentInterval = REFRESH_INTERVALS.NORMAL
let version = '0.0.0'

function formatUtilization(value: number | null | undefined): string {
  if (value == null) return 'N/A'
  return `${value}%`
}

function getTrayIconPath(): string {
  const ext = process.platform === 'win32' ? 'ico' : 'png'
  if (app.isPackaged) {
    return path.join(process.resourcesPath, `icon.${ext}`)
  }
  return path.join(app.getAppPath(), 'build', `icon.${ext}`)
}

export function initialize(): Tray {
  if (tray) return tray

  tray = new Tray(getTrayIconPath())
  tray.setToolTip('Claude Usage - Loading...')
  tray.on('click', () => tray?.popUpContextMenu())

  return tray
}

export function updateMenu(usageData?: UsageData): void {
  if (!tray) {
    console.error('TrayManager: Tray not initialized')
    return
  }

  const handleIntervalChange = (ms: number): void => {
    currentInterval = ms
    onIntervalChangeCallback?.(ms)
  }

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `Version ${version}`, click: () => onCheckUpdateCallback?.() },
    { type: 'separator' },
    {
      label: 'Refresh Interval',
      submenu: [
        { label: '10 seconds', type: 'radio', checked: currentInterval === REFRESH_INTERVALS.FAST, click: () => handleIntervalChange(REFRESH_INTERVALS.FAST) },
        { label: '30 seconds', type: 'radio', checked: currentInterval === REFRESH_INTERVALS.NORMAL, click: () => handleIntervalChange(REFRESH_INTERVALS.NORMAL) },
        { label: '60 seconds', type: 'radio', checked: currentInterval === REFRESH_INTERVALS.SLOW, click: () => handleIntervalChange(REFRESH_INTERVALS.SLOW) }
      ]
    },
    { label: 'Reset Widget Position', click: () => onResetPositionCallback?.() },
    { label: 'Refresh Now', click: () => onRefreshCallback?.() },
    { type: 'separator' },
    { role: 'quit' }
  ]))

  if (usageData?.error) {
    tray.setToolTip('Claude Usage - Error')
  } else {
    tray.setToolTip(`Claude Usage\n5h: ${formatUtilization(usageData?.five_hour?.utilization)} | 7d: ${formatUtilization(usageData?.seven_day?.utilization)}`)
  }
}

export function destroy(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
  onRefreshCallback = null
  onResetPositionCallback = null
  onCheckUpdateCallback = null
  onIntervalChangeCallback = null
}

export function onRefresh(cb: () => void): void { onRefreshCallback = cb }
export function onResetPosition(cb: () => void): void { onResetPositionCallback = cb }
export function onCheckUpdate(cb: () => void): void { onCheckUpdateCallback = cb }
export function onIntervalChange(cb: (ms: number) => void): void { onIntervalChangeCallback = cb }
export function setCurrentInterval(ms: number): void { currentInterval = ms }
export function setVersion(v: string): void { version = v }
