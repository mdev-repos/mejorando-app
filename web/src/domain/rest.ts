/** En qué momento del descanso se está, para cambiar el color y el aviso. */
export type RestPhase = 'normal' | 'warn' | 'alert' | 'done'

export const WARN_AT = 15
export const ALERT_AT = 10

export function restPhase(secondsLeft: number): RestPhase {
  if (secondsLeft <= 0) return 'done'
  if (secondsLeft <= ALERT_AT) return 'alert'
  if (secondsLeft <= WARN_AT) return 'warn'
  return 'normal'
}

export const PHASE_LABEL: Record<RestPhase, string> = {
  normal: 'DESCANSO',
  warn: 'YA CASI',
  alert: 'PREPARATE',
  done: 'LISTO',
}

export type Cue = 'tick' | 'end'

/** Qué sonido corresponde cuando el descanso llega a esta cantidad de segundos. */
export function restCue(secondsLeft: number): Cue | undefined {
  if (secondsLeft === 0) return 'end'
  if (secondsLeft >= 1 && secondsLeft <= 3) return 'tick'
  return undefined
}
