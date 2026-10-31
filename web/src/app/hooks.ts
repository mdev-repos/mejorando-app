import { useEffect, useState } from 'react'

/** Hora actual, que se actualiza mientras `active` sea verdadero. */
export function useNow(active: boolean, everyMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(id)
  }, [active, everyMs])
  return now
}

/** Mantiene la pantalla encendida mientras dura la sesión, si el navegador lo permite. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        if (cancelled) void lock.release()
      } catch {
        /* el navegador puede negarlo, la sesión sigue igual */
      }
    }
    void request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}
