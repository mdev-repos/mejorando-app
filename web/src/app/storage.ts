import { useEffect, useState } from 'react'

/**
 * Le pide al navegador que no borre los datos de la app cuando le falta espacio.
 * Devuelve undefined si el navegador no lo permite.
 */
export async function requestPersistence(): Promise<boolean | undefined> {
  try {
    if (!navigator.storage?.persist) return undefined
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return undefined
  }
}

/** Si los datos están protegidos del borrado automático. */
export function usePersistence(): boolean | undefined {
  const [state, setState] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    void requestPersistence().then(setState)
  }, [])
  return state
}
