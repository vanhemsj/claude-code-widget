import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserWindow, screen } from 'electron';
import { WINDOW_DIMENSIONS, IPC_CHANNELS } from '../../shared/constants.js';
import * as config from '../services/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let floatingWindow = null;
let alwaysOnTopInterval = null;

function getDefaultPosition() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  return {
    x: screenWidth - WINDOW_DIMENSIONS.FLOATING.WIDTH - 10,
    y: screenHeight - WINDOW_DIMENSIONS.FLOATING.HEIGHT - 10,
    width: WINDOW_DIMENSIONS.FLOATING.WIDTH,
    height: WINDOW_DIMENSIONS.FLOATING.HEIGHT
  };
}

function getPosition() {
  const saved = config.get('windowPosition');
  const defaults = getDefaultPosition();
  if (saved) {
    return { ...defaults, x: saved.x ?? defaults.x, y: saved.y ?? defaults.y };
  }
  return defaults;
}

function savePosition() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    const { x, y } = floatingWindow.getBounds();
    config.set('windowPosition', { x, y });
  }
}

function startAlwaysOnTopEnforcer() {
  if (alwaysOnTopInterval) return;

  alwaysOnTopInterval = setInterval(() => {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
      if (process.platform === 'linux') {
        floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      }
      floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }, 500);
}

function stopAlwaysOnTopEnforcer() {
  if (alwaysOnTopInterval) {
    clearInterval(alwaysOnTopInterval);
    alwaysOnTopInterval = null;
  }
}

export function createFloatingWindow() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    return floatingWindow;
  }

  const pos = getPosition();
  const isLinux = process.platform === 'linux';

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
      preload: path.join(__dirname, '..', '..', 'preload', 'index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  floatingWindow.loadFile(path.join(__dirname, '..', '..', 'renderer', 'floating-window', 'index.html'));

  floatingWindow.setAlwaysOnTop(true, 'screen-saver');
  if (isLinux) {
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  startAlwaysOnTopEnforcer();

  floatingWindow.on('closed', () => {
    floatingWindow = null;
    stopAlwaysOnTopEnforcer();
  });

  floatingWindow.on('moved', savePosition);

  return floatingWindow;
}

export function resetFloatingPosition() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.setBounds(getDefaultPosition());
    config.del('windowPosition');
  }
}

export function broadcastRefreshStart() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.webContents.send(IPC_CHANNELS.REFRESH_START);
  }
}

export function broadcastUsageData(usageData) {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.webContents.send(IPC_CHANNELS.USAGE_DATA, usageData);
  }
}

export function cleanup() {
  stopAlwaysOnTopEnforcer();
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.close();
  }
  floatingWindow = null;
}
