import Store from 'electron-store'
import { REFRESH_INTERVALS } from '../../shared/constants'
import type { WindowPosition } from '../../shared/types'

interface ConfigSchema {
  refreshInterval: number
  windowPosition: WindowPosition | null
}

const store = new Store<ConfigSchema>({
  name: 'config',
  defaults: {
    refreshInterval: REFRESH_INTERVALS.NORMAL,
    windowPosition: null
  }
})

export function get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
  return store.get(key)
}

export function set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
  store.set(key, value)
}

export function del<K extends keyof ConfigSchema>(key: K): void {
  store.delete(key)
}
