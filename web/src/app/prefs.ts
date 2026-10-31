import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPref(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function setPref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* sin almacenamiento, la preferencia vale solo mientras la app está abierta */
  }
  listeners.forEach((l) => l())
}

/** Preferencia guardada en el dispositivo (tema, módulos activos). */
export function usePref(key: string, fallback: string): string {
  return useSyncExternalStore(subscribe, () => getPref(key, fallback))
}
