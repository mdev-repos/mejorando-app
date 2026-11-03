import { useEffect, useState } from 'react'

export type ChangeType = 'nuevo' | 'mejora' | 'arreglo'

export interface Release {
  version: string
  date: string
  changes: { type: ChangeType; text: string }[]
}

export const CHANGE_LABEL: Record<ChangeType, string> = {
  nuevo: 'Nuevo',
  mejora: 'Mejora',
  arreglo: 'Arreglo',
}

/** Compara dos versiones como 0.3.0. Devuelve un número positivo si `a` es más nueva que `b`. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

/** Las versiones posteriores a `since`, de la más nueva a la más vieja. */
export function releasesSince(releases: Release[], since: string): Release[] {
  return releases
    .filter((r) => compareVersions(r.version, since) > 0)
    .sort((a, b) => compareVersions(b.version, a.version))
}

export function formatReleaseDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function parse(data: unknown): Release[] | null {
  const list = (data as { releases?: unknown } | null)?.releases
  if (!Array.isArray(list)) return null
  return list.filter(
    (r): r is Release =>
      typeof r?.version === 'string' && typeof r?.date === 'string' && Array.isArray(r?.changes),
  )
}

/**
 * Lee la lista de novedades publicada junto con la app. Con `fresh` va a buscar la copia más
 * nueva a la red, que es la que describe la versión por instalar, y si no hay conexión no devuelve nada.
 * Sin `fresh` usa la copia guardada con la app, así funciona sin conexión.
 */
export async function loadReleases(fresh: boolean): Promise<Release[] | null> {
  try {
    const url = `${import.meta.env.BASE_URL}novedades.json${fresh ? `?v=${Date.now()}` : ''}`
    const res = await fetch(url, fresh ? { cache: 'no-store' } : undefined)
    if (!res.ok) return null
    return parse(await res.json())
  } catch {
    return null
  }
}

/** undefined mientras carga, null si no se pudo leer. */
export function useReleases(fresh: boolean): Release[] | null | undefined {
  const [releases, setReleases] = useState<Release[] | null | undefined>(undefined)
  useEffect(() => {
    let cancelled = false
    void loadReleases(fresh).then((r) => {
      if (!cancelled) setReleases(r)
    })
    return () => {
      cancelled = true
    }
  }, [fresh])
  return releases
}
