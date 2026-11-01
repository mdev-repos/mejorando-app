import { describe, expect, it } from 'vitest'
import { backupDue, daysSince } from './backup'

const DAY = 86_400_000
const now = 100 * DAY

describe('recordatorio de copia', () => {
  it('no molesta si todavía no hay entrenamientos', () => {
    expect(backupDue({ now, doneSessions: 0 })).toBe(false)
  })

  it('avisa si hay entrenamientos y nunca se guardó una copia', () => {
    expect(backupDue({ now, doneSessions: 1 })).toBe(true)
  })

  it('espera dos semanas desde la última copia', () => {
    expect(backupDue({ now, last: now - 13 * DAY, doneSessions: 5 })).toBe(false)
    expect(backupDue({ now, last: now - 15 * DAY, doneSessions: 5 })).toBe(true)
  })

  it('respeta el "más tarde"', () => {
    expect(backupDue({ now, doneSessions: 5, snoozedUntil: now + DAY })).toBe(false)
    expect(backupDue({ now, doneSessions: 5, snoozedUntil: now - DAY })).toBe(true)
  })

  it('cuenta los días desde la última copia', () => {
    expect(daysSince(now - 20 * DAY - 5000, now)).toBe(20)
    expect(daysSince(now + DAY, now)).toBe(0)
  })
})
