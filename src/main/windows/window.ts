import path from 'path'
import { BrowserWindow, screen, app } from 'electron'
import { WINDOW_DIMENSIONS, IPC_CHANNELS } from '../../shared/constants'
import * as config from '../services/config'
import type { UsageData } from '../../shared/types'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined
declare const MAIN_WINDOW_VITE_NAME: string | undefined

let floatingWindow: BrowserWindow | null = null
let alwaysOnTopInterval: ReturnType<typeof setInterval> | null = null

function getDefaultPosition() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
  return {
    x: screenWidth - WINDOW_DIMENSIONS.FLOATING.WIDTH - 10,
    y: screenHeight - WINDOW_DIMENSIONS.FLOATING.HEIGHT - 10,
    width: WINDOW_DIMENSIONS.FLOATING.WIDTH,
    height: WINDOW_DIMENSIONS.FLOATING.HEIGHT
  }
}

function getPosition() {
  const saved = config.get('windowPosition')
  const defaults = getDefaultPosition()
  if (saved) {
    return { ...defaults, x: saved.x ?? defaults.x, y: saved.y ?? defaults.y }
  }
  return defaults
}

function savePosition(): void {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    const { x, y } = floatingWindow.getBounds()
    config.set('windowPosition', { x, y })
  }
}

function startAlwaysOnTopEnforcer(): void {
  if (alwaysOnTopInterval) return

  alwaysOnTopInterval = setInterval(() => {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
      if (process.platform === 'linux') {
        floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      }
      floatingWindow.setAlwaysOnTop(true, 'screen-saver')
    }
  }, 500)
}

function stopAlwaysOnTopEnforcer(): void {
  if (alwaysOnTopInterval) {
    clearInterval(alwaysOnTopInterval)
    alwaysOnTopInterval = null
  }
}

export function createFloatingWindow(): BrowserWindow {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow
  }

  const pos = getPosition()
  const isLinux = process.platform === 'linux'

  floatingWindow = new BrowserWindow({
    width: pos.width,
    height: pos.height,
    x: pos.x,
    y: pos.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: !isLinux,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) {
    floatingWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    floatingWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    floatingWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))
  }

  floatingWindow.setAlwaysOnTop(true, 'screen-saver')
  if (isLinux) {
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  startAlwaysOnTopEnforcer()

  floatingWindow.on('closed', () => {
    floatingWindow = null
    stopAlwaysOnTopEnforcer()
  })

  floatingWindow.on('moved', savePosition)

  return floatingWindow
}

export function resetFloatingPosition(): void {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.setBounds(getDefaultPosition())
    config.del('windowPosition')
  }
}

export function broadcastRefreshStart(): void {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.webContents.send(IPC_CHANNELS.REFRESH_START)
  }
}

export function broadcastUsageData(usageData: UsageData): void {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.webContents.send(IPC_CHANNELS.USAGE_DATA, usageData)
  }
}

export function cleanup(): void {
  stopAlwaysOnTopEnforcer()
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.close()
  }
  floatingWindow = null
}
