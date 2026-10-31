import Dexie, { type Table } from 'dexie'
import type { Exercise, Session, SetLog, Training } from '../domain/types'

/**
 * Datos locales. Cada versión nueva de las tablas se agrega con otro `version(n)` y su migración,
 * para no perder lo que ya está guardado en el teléfono.
 */
export class CaminoDB extends Dexie {
  exercises!: Table<Exercise, string>
  trainings!: Table<Training, string>
  sessions!: Table<Session, string>
  sets!: Table<SetLog, string>

  constructor(name = 'camino') {
    super(name)
    this.version(1).stores({
      exercises: 'id, group',
      trainings: 'id, updatedAt',
      sessions: 'id, status, startedAt',
      sets: 'id, sessionId, exerciseId, [exerciseId+kind]',
    })
  }
}

export const db = new CaminoDB()

/** Los identificadores se generan en el dispositivo, para poder crear datos sin conexión. */
export function newId(): string {
  return crypto.randomUUID()
}
