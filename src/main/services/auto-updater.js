import { app, dialog } from 'electron';
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;
let updateAvailable = false;
let updateCheckInterval = null;
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

export async function init() {
  if (!app.isPackaged) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    updateAvailable = true;
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) has been downloaded.`,
      detail: 'The application will be updated on next restart. Do you want to restart now?',
      buttons: ['Restart', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  checkForUpdates();
  updateCheckInterval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
}

export function checkForUpdates(showNoUpdateDialog = false) {
  if (!app.isPackaged) {
    if (showNoUpdateDialog) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update',
        message: `Current version: ${app.getVersion()}`,
        detail: 'Update check disabled in development mode.',
        buttons: ['OK']
      });
    }
    return Promise.resolve(null);
  }

  if (showNoUpdateDialog) {
    return autoUpdater.checkForUpdates().then((result) => {
      if (!result || !updateAvailable) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update',
          message: `Current version: ${app.getVersion()}`,
          detail: 'You are using the latest version.',
          buttons: ['OK']
        });
      }
      return result;
    }).catch((err) => {
      dialog.showMessageBox({
        type: 'error',
        title: 'Error',
        message: 'Unable to check for updates.',
        detail: err.message,
        buttons: ['OK']
      });
    });
  }

  return autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    console.error('Update check failed:', err);
  });
}

export function getVersion() {
  return app.getVersion();
}

export function cleanup() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}
