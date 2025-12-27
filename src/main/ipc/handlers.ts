import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import * as usageApi from '../services/usage-api'
import type { UsageData } from '../../shared/types'

interface HandlerOptions {
  onRefresh: () => Promise<UsageData>
}

export function registerHandlers({ onRefresh }: HandlerOptions): void {
  ipcMain.handle(IPC_CHANNELS.GET_USAGE, () => usageApi.getCachedData())
  ipcMain.handle(IPC_CHANNELS.REFRESH_USAGE, () => onRefresh())
}

export function unregisterHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.GET_USAGE)
  ipcMain.removeHandler(IPC_CHANNELS.REFRESH_USAGE)
}
