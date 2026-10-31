import type { RepTarget } from './types'

export function formatTarget(t: RepTarget): string {
  switch (t.kind) {
    case 'fixed':
      return `${t.reps}`
    case 'range':
      return `${t.min} - ${t.max}`
    case 'failure':
      return 'al fallo'
    case 'sequence':
      return t.reps.join(' | ')
  }
}

export function formatSets(sets: number, t: RepTarget): string {
  if (t.kind === 'sequence') return `${sets} series, ${formatTarget(t)}`
  return `${sets} x ${formatTarget(t)}`
}

export function formatRest(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Lo que se pide en una serie en particular. En una secuencia, cada serie tiene el suyo. */
export function targetForSet(t: RepTarget, setIndex: number): RepTarget {
  if (t.kind !== 'sequence') return t
  const reps = t.reps[Math.min(setIndex, t.reps.length) - 1] ?? t.reps[t.reps.length - 1] ?? 8
  return { kind: 'fixed', reps }
}

/** Las repeticiones con las que conviene arrancar el control numérico de una serie. */
export function startReps(t: RepTarget): number {
  switch (t.kind) {
    case 'fixed':
      return t.reps
    case 'range':
      return t.min
    case 'sequence':
      return t.reps[0] ?? 8
    case 'failure':
      return 8
  }
}

/**
 * Arma un escalonado. Con 4 series, 10 repeticiones en la primera y un salto de -2
 * queda 10 | 8 | 6 | 4. El salto puede ser positivo, y nunca baja de 1 repetición.
 */
export function escalonado(sets: number, first: number, step: number): RepTarget {
  const reps = Array.from({ length: sets }, (_, i) => Math.max(1, first + step * i))
  return { kind: 'sequence', reps }
}

/** Los descansos que se ofrecen al armar un ejercicio, en segundos. */
export const REST_PRESETS = [45, 60, 90, 120, 150, 180] as const

/** Los descansos habituales dentro de un JumpSet, que son más cortos. */
export const JUMP_REST_PRESETS = [15, 20, 30, 45, 60, 90] as const
