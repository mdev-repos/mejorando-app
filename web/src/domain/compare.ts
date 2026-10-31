export type Verdict = 'up' | 'same' | 'down'

export interface Lift {
  weight: number
  reps: number
}

/**
 * Compara una serie con la misma serie de la vez anterior.
 * Más peso mejora, aunque haya menos repeticiones. Con el mismo peso, más repeticiones mejora.
 */
export function compareSet(current: Lift, previous: Lift | undefined): Verdict | undefined {
  if (!previous) return undefined
  if (current.weight > previous.weight) return 'up'
  if (current.weight < previous.weight) return 'down'
  if (current.reps > previous.reps) return 'up'
  if (current.reps < previous.reps) return 'down'
  return 'same'
}

/** El tramo de rest pause se compara aparte, por repeticiones. */
export function compareExtra(current: number, previous: number | undefined): Verdict | undefined {
  if (previous === undefined) return undefined
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'same'
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  up: 'Mejoraste',
  same: 'Igualaste',
  down: 'Por debajo',
}

export const VERDICT_SYMBOL: Record<Verdict, string> = {
  up: '▲',
  same: '=',
  down: '▼',
}
