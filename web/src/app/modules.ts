import { setPref, usePref } from './prefs'

export interface ModuleDef {
  id: 'gym' | 'alimentacion' | 'peso' | 'pasos'
  name: string
  blurb: string
  available: boolean
  path?: string
}

/** Las funciones de la suite. Cada persona activa las que usa. */
export const MODULES: ModuleDef[] = [
  {
    id: 'gym',
    name: 'Gym+',
    blurb: 'Planificá y registrá tu entrenamiento de fuerza.',
    available: true,
    path: '/gym',
  },
  { id: 'alimentacion', name: 'Alimentación+', blurb: 'Comidas y macros.', available: false },
  { id: 'peso', name: 'Peso+', blurb: 'Peso y medidas.', available: false },
  { id: 'pasos', name: 'Pasos+', blurb: 'Pasos y actividad diaria.', available: false },
]

const KEY = 'camino.modulos'

function parse(raw: string): Record<string, boolean> {
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

export function useEnabledModules(): {
  isEnabled: (id: string) => boolean
  setEnabled: (id: string, on: boolean) => void
} {
  const raw = usePref(KEY, '{"gym":true}')
  const map = parse(raw)
  return {
    isEnabled: (id) => map[id] === true,
    setEnabled: (id, on) => setPref(KEY, JSON.stringify({ ...map, [id]: on })),
  }
}
