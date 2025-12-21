import path from 'path';
import { fileURLToPath } from 'url';
import { Tray, Menu, app } from 'electron';
import { REFRESH_INTERVALS } from '../../shared/constants.js';
import { formatUtilization } from '../../shared/formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;
let onRefreshCallback = null;
let onResetPositionCallback = null;
let onCheckUpdateCallback = null;
let onIntervalChangeCallback = null;
let currentInterval = REFRESH_INTERVALS.NORMAL;
let version = '0.0.0';

function getTrayIconPath() {
  const ext = process.platform === 'win32' ? 'ico' : 'png';
  if (app.isPackaged) {
    return path.join(process.resourcesPath, `icon.${ext}`);
  }
  return path.join(__dirname, '..', '..', '..', 'build', `icon.${ext}`);
}

function buildIntervalSubmenu() {
  const handleChange = (ms) => {
    currentInterval = ms;
    onIntervalChangeCallback?.(ms);
  };

  return [
    {
      label: '10 seconds',
      type: 'radio',
      checked: currentInterval === REFRESH_INTERVALS.FAST,
      click: () => handleChange(REFRESH_INTERVALS.FAST)
    },
    {
      label: '30 seconds',
      type: 'radio',
      checked: currentInterval === REFRESH_INTERVALS.NORMAL,
      click: () => handleChange(REFRESH_INTERVALS.NORMAL)
    },
    {
      label: '60 seconds',
      type: 'radio',
      checked: currentInterval === REFRESH_INTERVALS.SLOW,
      click: () => handleChange(REFRESH_INTERVALS.SLOW)
    }
  ];
}

function buildMenuTemplate(usageData) {
  if (usageData?.error) {
    return [
      { label: `Error: ${usageData.error}`, enabled: false },
      { type: 'separator' },
      { label: 'Refresh', click: () => onRefreshCallback?.() },
      { role: 'quit' }
    ];
  }

  return [
    { label: `Version ${version}`, click: () => onCheckUpdateCallback?.() },
    { type: 'separator' },
    { label: 'Refresh Interval', submenu: buildIntervalSubmenu() },
    { label: 'Reset Widget Position', click: () => onResetPositionCallback?.() },
    { label: 'Refresh Now', click: () => onRefreshCallback?.() },
    { type: 'separator' },
    { role: 'quit' }
  ];
}

export function initialize() {
  if (tray) return tray;

  tray = new Tray(getTrayIconPath());
  tray.setToolTip('Claude Usage - Loading...');
  tray.on('click', () => tray.popUpContextMenu());

  return tray;
}

export function updateMenu(usageData) {
  if (!tray) {
    console.error('TrayManager: Tray not initialized');
    return;
  }

  const template = buildMenuTemplate(usageData);
  tray.setContextMenu(Menu.buildFromTemplate(template));

  if (usageData?.error) {
    tray.setToolTip('Claude Usage - Error');
  } else {
    tray.setToolTip(`Claude Usage\n5h: ${formatUtilization(usageData.five_hour?.utilization)} | 7d: ${formatUtilization(usageData.seven_day?.utilization)}`);
  }
}

export function destroy() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
  onRefreshCallback = null;
  onResetPositionCallback = null;
  onCheckUpdateCallback = null;
  onIntervalChangeCallback = null;
}

export function onRefresh(cb) { onRefreshCallback = cb; }
export function onResetPosition(cb) { onResetPositionCallback = cb; }
export function onCheckUpdate(cb) { onCheckUpdateCallback = cb; }
export function onIntervalChange(cb) { onIntervalChangeCallback = cb; }
export function setCurrentInterval(ms) { currentInterval = ms; }
export function setVersion(v) { version = v; }
