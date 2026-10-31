import type { Equipment, Exercise } from './types'

const FORMAT = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2, useGrouping: false })

/** Un número como se escribe en Argentina, con coma decimal. */
export function formatNumber(n: number): string {
  return FORMAT.format(n)
}

/** Lee un número escrito con coma o con punto. Devuelve undefined si no es un número. */
export function parseNumber(text: string): number | undefined {
  const clean = text.trim().replace(/\s/g, '').replace(',', '.')
  if (clean === '' || clean === '-' || clean === '.') return undefined
  const n = Number(clean)
  return Number.isFinite(n) ? n : undefined
}

/** Los saltos de peso que se ofrecen, en kilos. */
export const WEIGHT_STEPS = [1, 2, 2.5, 5, 10] as const

const STEP_BY_EQUIPMENT: Record<Equipment, number> = {
  barra: 2.5,
  mancuernas: 2,
  maquina: 5,
  polea: 5,
  'peso-corporal': 1,
  otro: 2.5,
}

/** Con cuánto peso se sube por defecto, según el equipamiento. Se puede cambiar por ejercicio. */
export function defaultWeightStep(exercise: Pick<Exercise, 'equipment'> | undefined): number {
  return exercise ? STEP_BY_EQUIPMENT[exercise.equipment] : 2.5
}

/** Cuánto vale cada toque cuando se mantiene apretado un botón, que acelera de a poco. */
export function holdMultiplier(repeats: number): number {
  if (repeats < 8) return 1
  if (repeats < 16) return 2
  return 4
}
