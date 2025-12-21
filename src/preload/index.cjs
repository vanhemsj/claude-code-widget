const { contextBridge, ipcRenderer } = require('electron');

const IPC_CHANNELS = {
  GET_USAGE: 'get-usage',
  REFRESH_USAGE: 'refresh-usage',
  USAGE_DATA: 'usage-data',
  REFRESH_START: 'refresh-start'
};

contextBridge.exposeInMainWorld('api', {
  getUsage: () => ipcRenderer.invoke(IPC_CHANNELS.GET_USAGE),
  refreshUsage: () => ipcRenderer.invoke(IPC_CHANNELS.REFRESH_USAGE),
  onUsageData: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.USAGE_DATA, (event, data) => callback(data));
  },
  onRefreshStart: (callback) => {
    ipcRenderer.on(IPC_CHANNELS.REFRESH_START, () => callback());
  }
});
