import { app } from 'electron';
import * as usageApi from '../services/usage-api.js';
import * as autoUpdater from '../services/auto-updater.js';
import * as windowManager from '../windows/window.js';
import * as trayManager from '../windows/tray.js';
import * as refreshManager from '../services/refresh.js';
import { registerHandlers, unregisterHandlers } from '../ipc/handlers.js';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

async function refreshUsage() {
  windowManager.broadcastRefreshStart();
  const usageData = await usageApi.fetchUsage();
  trayManager.updateMenu(usageData);
  windowManager.broadcastUsageData(usageData);
  return usageData;
}

async function initialize() {
  refreshManager.initialize();
  trayManager.initialize();

  trayManager.onRefresh(refreshUsage);
  trayManager.onResetPosition(() => windowManager.resetFloatingPosition());
  trayManager.onIntervalChange((ms) => {
    refreshManager.setRefreshInterval(ms);
    trayManager.setCurrentInterval(ms);
  });
  trayManager.onCheckUpdate(() => autoUpdater.checkForUpdates(true));

  trayManager.setCurrentInterval(refreshManager.getInterval());
  trayManager.setVersion(autoUpdater.getVersion());

  windowManager.createFloatingWindow();
  registerHandlers({ onRefresh: refreshUsage });
  refreshManager.onRefresh(refreshUsage);

  await refreshUsage();
  refreshManager.start();
  await autoUpdater.init();
}

function cleanup() {
  refreshManager.stop();
  autoUpdater.cleanup();
  unregisterHandlers();
  windowManager.cleanup();
  trayManager.destroy();
}

if (gotTheLock) {
  app.whenReady().then(initialize);
  app.on('window-all-closed', () => {});
  app.on('before-quit', cleanup);
}
