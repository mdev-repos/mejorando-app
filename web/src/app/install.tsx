import { useEffect, useState } from 'react'

interface InstallEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// el aviso del navegador puede llegar antes de que se muestre cualquier pantalla, así que se guarda acá
let saved: InstallEvent | null = null
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    saved = e as InstallEvent
    listeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    saved = null
    listeners.forEach((l) => l())
  })
}

/** Dice si se puede instalar desde la app, y da la acción. Con la app ya instalada no ofrece nada. */
export function useInstall(): { available: boolean; install: () => Promise<void> } {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  const standalone =
    typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
  return {
    available: saved !== null && !standalone,
    install: async () => {
      const ev = saved
      if (!ev) return
      await ev.prompt()
      await ev.userChoice
      saved = null
      listeners.forEach((l) => l())
    },
  }
}

export function InstallCard() {
  const { available, install } = useInstall()
  if (!available) return null
  return (
    <div className="card stack">
      <div className="t1">Instalá MejorAndo</div>
      <div className="t2">Queda en tu pantalla de inicio y funciona sin conexión.</div>
      <button className="btn small primary" onClick={() => void install()}>
        Instalar
      </button>
    </div>
  )
}
