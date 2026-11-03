import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { compareVersions, releasesSince, useReleases } from './novedades'
import { ReleaseList } from './WhatsNew'

/** Avisa cuando hay una versión nueva de la app, muestra qué trae y deja actualizar con un toque. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [open, setOpen] = useState(false)
  // la copia de la red describe la versión por instalar, que la instalada todavía no conoce
  const releases = useReleases(needRefresh)
  if (!needRefresh) return null
  const nuevas = releases ? releasesSince(releases, __APP_VERSION__) : []
  const ultima = nuevas.sort((a, b) => compareVersions(b.version, a.version))[0]
  return (
    <div className={`toast${open ? ' largo' : ''}`} role="status">
      {open && nuevas.length > 0 && (
        <div className="toast-lista">
          <ReleaseList releases={nuevas} />
        </div>
      )}
      <div className="toast-fila">
        <div className="grow">
          Hay una versión nueva de MejorAndo{ultima ? `, la ${ultima.version}` : ''}
        </div>
        {nuevas.length > 0 && (
          <button className="sec" onClick={() => setOpen((v) => !v)}>
            {open ? 'Ocultar' : 'Qué trae'}
          </button>
        )}
        <button onClick={() => void updateServiceWorker(true)}>Actualizar</button>
      </div>
    </div>
  )
}
