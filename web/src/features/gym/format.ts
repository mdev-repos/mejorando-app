import { formatRest, formatSets, formatTarget } from '../../domain/targets'
import type { Exercise, PlanItem } from '../../domain/types'

type Lookup = (id: string) => Exercise | undefined

export function itemTitle(item: PlanItem, lookup: Lookup): string {
  if (item.kind === 'jumpset') {
    return item.steps.map((s) => lookup(s.exerciseId)?.name ?? '?').join(' + ')
  }
  return lookup(item.exerciseId)?.name ?? 'Ejercicio'
}

export function itemSummary(item: PlanItem): string {
  switch (item.kind) {
    case 'normal':
      return `${formatSets(item.sets, item.target)} · descanso ${formatRest(item.restSec)}`
    case 'restpause':
      return `${formatSets(item.sets, item.target)} · rest pause ${item.restPauseSec}'' en la última`
    case 'jumpset':
      return `JumpSet · ${item.rounds} rondas · ${item.steps.map((s) => formatTarget(s.target)).join(' | ')}`
  }
}

export function itemTag(item: PlanItem): string {
  return item.kind === 'normal' ? 'Normal' : item.kind === 'restpause' ? 'Rest pause' : 'JumpSet'
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatDuration(startedAt: number, endedAt: number | undefined): string {
  if (!endedAt) return ''
  const min = Math.max(1, Math.round((endedAt - startedAt) / 60000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}
