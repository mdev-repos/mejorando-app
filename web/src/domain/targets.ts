import type { RepTarget } from './types'

export function formatTarget(t: RepTarget): string {
  switch (t.kind) {
    case 'fixed':
      return `${t.reps}`
    case 'range':
      return `${t.min} - ${t.max}`
    case 'failure':
      return 'al fallo'
  }
}

export function formatSets(sets: number, t: RepTarget): string {
  return `${sets} x ${formatTarget(t)}`
}

export function formatRest(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
