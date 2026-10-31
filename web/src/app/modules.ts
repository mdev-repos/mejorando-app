import { setPref, usePref } from './prefs'
import type { ModuleId } from '../brand/Logo'

export interface ModuleDef {
  id: ModuleId
  name: string
  blurb: string
  available: boolean
  path?: string
}

/** Las funciones de la suite. Cada persona activa las que usa. */
export const MODULES: ModuleDef[] = [
  {
    id: 'gym',
    name: 'EntrenAndo',
    blurb: 'Planificá y registrá tu entrenamiento de fuerza.',
    available: true,
    path: '/gym',
  },
  {
    id: 'alimentacion',
    name: 'AlimentAndo',
    blurb: 'Calorías, peso y medidas.',
    available: false,
  },
  { id: 'pasos', name: 'CaminAndo', blurb: 'Tus pasos de cada día.', available: false },
]

const KEY = 'mejorando.modulos'

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
