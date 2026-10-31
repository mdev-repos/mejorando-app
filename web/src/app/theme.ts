import { useEffect } from 'react'
import { setPref, usePref } from './prefs'

export type ThemePref = 'sistema' | 'oscuro' | 'claro'
const KEY = 'camino.tema'

export function useThemePref(): [ThemePref, (t: ThemePref) => void] {
  const raw = usePref(KEY, 'sistema')
  const pref: ThemePref = raw === 'oscuro' || raw === 'claro' ? raw : 'sistema'
  return [pref, (t) => setPref(KEY, t)]
}

/** Aplica el tema elegido. "Sistema" deja que decida el teléfono. */
export function useApplyTheme(): void {
  const [pref] = useThemePref()
  useEffect(() => {
    const root = document.documentElement
    if (pref === 'sistema') delete root.dataset.theme
    else root.dataset.theme = pref === 'oscuro' ? 'dark' : 'light'
    const meta = document.querySelector('meta[name="theme-color"]')
    const dark =
      pref === 'oscuro' ||
      (pref === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    meta?.setAttribute('content', dark ? '#0E1117' : '#E8EBF1')
  }, [pref])
}
