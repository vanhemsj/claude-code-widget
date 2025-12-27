import { app } from 'electron'
import * as usageApi from './services/usage-api'
import * as autoUpdater from './services/auto-updater'
import * as windowManager from './windows/window'
import * as trayManager from './windows/tray'
import * as refreshManager from './services/refresh'
import { registerHandlers, unregisterHandlers } from './ipc/handlers'
import type { UsageData } from '../shared/types'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}

async function refreshUsage(): Promise<UsageData> {
  windowManager.broadcastRefreshStart()
  const usageData = await usageApi.fetchUsage()
  trayManager.updateMenu(usageData)
  windowManager.broadcastUsageData(usageData)
  return usageData
}

async function initialize(): Promise<void> {
  refreshManager.initialize()
  trayManager.initialize()

  trayManager.onRefresh(refreshUsage)
  trayManager.onResetPosition(() => windowManager.resetFloatingPosition())
  trayManager.onIntervalChange((ms) => {
    refreshManager.setRefreshInterval(ms)
    trayManager.setCurrentInterval(ms)
  })
  trayManager.onCheckUpdate(() => autoUpdater.checkForUpdates(true))

  trayManager.setCurrentInterval(refreshManager.getInterval())
  trayManager.setVersion(autoUpdater.getVersion())

  windowManager.createFloatingWindow()
  registerHandlers({ onRefresh: refreshUsage })
  refreshManager.onRefresh(refreshUsage)

  await refreshUsage()
  refreshManager.start()
  await autoUpdater.init()
}

function cleanup(): void {
  refreshManager.stop()
  autoUpdater.cleanup()
  unregisterHandlers()
  windowManager.cleanup()
  trayManager.destroy()
}

if (gotTheLock) {
  app.whenReady().then(initialize)
  app.on('window-all-closed', () => {})
  app.on('before-quit', cleanup)
}
