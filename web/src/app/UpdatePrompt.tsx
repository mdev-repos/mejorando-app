import { useRegisterSW } from 'virtual:pwa-register/react'

/** Avisa cuando hay una versión nueva de la app y deja actualizar con un toque. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="toast" role="status">
      <div className="grow">Hay una versión nueva de Camino+</div>
      <button onClick={() => void updateServiceWorker(true)}>Actualizar</button>
    </div>
  )
}
