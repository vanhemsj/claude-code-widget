import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants.js';
import * as usageApi from '../services/usage-api.js';

export function registerHandlers({ onRefresh }) {
  ipcMain.handle(IPC_CHANNELS.GET_USAGE, () => usageApi.getCachedData());

  ipcMain.handle(IPC_CHANNELS.REFRESH_USAGE, () => onRefresh());
}

export function unregisterHandlers() {
  ipcMain.removeHandler(IPC_CHANNELS.GET_USAGE);
  ipcMain.removeHandler(IPC_CHANNELS.REFRESH_USAGE);
}
