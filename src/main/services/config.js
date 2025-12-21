import Store from 'electron-store';
import { REFRESH_INTERVALS } from '../../shared/constants.js';

const store = new Store({
  name: 'config',
  projectName: 'claude-code-widget',
  defaults: {
    refreshInterval: REFRESH_INTERVALS.NORMAL,
    windowPosition: null
  }
});

export function get(key, defaultValue = null) {
  return store.get(key, defaultValue);
}

export function set(key, value) {
  store.set(key, value);
}

export function del(key) {
  store.delete(key);
}
