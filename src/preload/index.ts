import { contextBridge, ipcRenderer } from 'electron'
import type { UsageData } from '../shared/types'

const IPC_CHANNELS = {
  GET_USAGE: 'get-usage',
  REFRESH_USAGE: 'refresh-usage',
  USAGE_DATA: 'usage-data',
  REFRESH_START: 'refresh-start'
} as const

contextBridge.exposeInMainWorld('api', {
  getUsage: (): Promise<UsageData | null> => ipcRenderer.invoke(IPC_CHANNELS.GET_USAGE),
  refreshUsage: (): Promise<UsageData> => ipcRenderer.invoke(IPC_CHANNELS.REFRESH_USAGE),
  onUsageData: (callback: (data: UsageData) => void): void => {
    ipcRenderer.on(IPC_CHANNELS.USAGE_DATA, (_event, data: UsageData) => callback(data))
  },
  onRefreshStart: (callback: () => void): void => {
    ipcRenderer.on(IPC_CHANNELS.REFRESH_START, () => callback())
  }
})
