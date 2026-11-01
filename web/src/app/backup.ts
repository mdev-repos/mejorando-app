import { setPref, usePref } from './prefs'

const LAST = 'mejorando.copia'
const SNOOZE = 'mejorando.copia.pospuesta'
const DAY = 86_400_000

/** Cada cuántos días se recuerda guardar una copia. */
export const BACKUP_EVERY_DAYS = 14
const SNOOZE_DAYS = 3

export function markBackup(now = Date.now()): void {
  setPref(LAST, String(now))
}

export function snoozeBackup(now = Date.now()): void {
  setPref(SNOOZE, String(now + SNOOZE_DAYS * DAY))
}

function asTime(raw: string): number | undefined {
  const n = Number(raw)
  return raw !== '' && Number.isFinite(n) && n > 0 ? n : undefined
}

export function useLastBackup(): number | undefined {
  return asTime(usePref(LAST, ''))
}

export function useBackupSnooze(): number {
  return asTime(usePref(SNOOZE, '')) ?? 0
}

/** Hay que recordar la copia si ya hay entrenamientos y pasó mucho tiempo, o nunca se guardó una. */
export function backupDue(o: {
  now: number
  last?: number
  doneSessions: number
  snoozedUntil?: number
}): boolean {
  if (o.doneSessions === 0) return false
  if (o.snoozedUntil !== undefined && o.now < o.snoozedUntil) return false
  if (o.last === undefined) return true
  return o.now - o.last > BACKUP_EVERY_DAYS * DAY
}

export function daysSince(last: number, now: number): number {
  return Math.max(0, Math.floor((now - last) / DAY))
}
