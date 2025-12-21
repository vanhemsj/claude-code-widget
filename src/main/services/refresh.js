import { powerMonitor } from 'electron';
import { REFRESH_INTERVALS } from '../../shared/constants.js';
import * as config from './config.js';

let intervalId = null;
let intervalMs = REFRESH_INTERVALS.NORMAL;
let refreshCallback = null;
let wasRunning = false;

export function initialize() {
  intervalMs = config.get('refreshInterval', REFRESH_INTERVALS.NORMAL);

  powerMonitor.on('suspend', () => {
    wasRunning = intervalId !== null;
    if (wasRunning) stop();
  });

  powerMonitor.on('resume', () => {
    if (wasRunning) {
      start();
      refreshCallback?.();
    }
  });
}

export function start() {
  stop();
  if (refreshCallback) {
    intervalId = setInterval(refreshCallback, intervalMs);
  }
}

export function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function setRefreshInterval(ms) {
  intervalMs = ms;
  config.set('refreshInterval', ms);
  if (intervalId) start();
}

export function getInterval() {
  return intervalMs;
}

export function onRefresh(callback) {
  refreshCallback = callback;
}
