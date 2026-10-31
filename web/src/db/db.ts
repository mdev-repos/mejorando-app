import Dexie, { type Table } from 'dexie'
import type {
  Exercise,
  ExerciseSettings,
  Macrocycle,
  Mesocycle,
  Session,
  SetLog,
  Training,
} from '../domain/types'

/**
 * Datos locales. Cada versión nueva de las tablas se agrega con otro `version(n)` y su migración,
 * para no perder lo que ya está guardado en el teléfono.
 */
export class MejorAndoDB extends Dexie {
  exercises!: Table<Exercise, string>
  exerciseSettings!: Table<ExerciseSettings, string>
  macrocycles!: Table<Macrocycle, string>
  mesocycles!: Table<Mesocycle, string>
  trainings!: Table<Training, string>
  sessions!: Table<Session, string>
  sets!: Table<SetLog, string>

  constructor(name = 'mejorando') {
    super(name)
    this.version(1).stores({
      exercises: 'id, group',
      trainings: 'id, updatedAt',
      sessions: 'id, status, startedAt',
      sets: 'id, sessionId, exerciseId, [exerciseId+kind]',
    })
    // Versión 2, los cuatro niveles. Lo que ya estaba guardado pasa a un macrociclo y un mesociclo propios.
    this.version(2)
      .stores({
        macrocycles: 'id, updatedAt',
        mesocycles: 'id, macroId, order',
        trainings: 'id, mesoId, updatedAt',
        sessions: 'id, status, startedAt, trainingId, mesoId',
      })
      .upgrade(async (tx) => {
        const old = await tx.table('trainings').toArray()
        if (!old.length) return
        const now = Date.now()
        const macroId = newId()
        const mesoId = newId()
        const executions = 4
        await tx
          .table('macrocycles')
          .add({ id: macroId, name: 'Mis entrenamientos', createdAt: now, updatedAt: now })
        await tx.table('mesocycles').add({
          id: mesoId,
          macroId,
          name: 'General',
          order: 0,
          mode: 'simple',
          executions,
          createdAt: now,
          updatedAt: now,
        })
        for (const [i, t] of old.entries()) {
          await tx.table('trainings').update(t.id, { mesoId, order: i })
        }
        const sessions = (await tx.table('sessions').toArray()).sort(
          (a, b) => a.startedAt - b.startedAt,
        )
        const seen = new Map<string, number>()
        for (const s of sessions) {
          const n = (seen.get(s.trainingId) ?? 0) + 1
          seen.set(s.trainingId, n)
          await tx.table('sessions').update(s.id, {
            mesoId,
            mesoName: 'General',
            execution: Math.min(n, executions),
            executionsTotal: executions,
          })
        }
      })
    // Versión 3, ajustes por ejercicio, como el paso de peso.
    this.version(3).stores({ exerciseSettings: 'exerciseId' })
  }
}

export const db = new MejorAndoDB()

/** Los identificadores se generan en el dispositivo, para poder crear datos sin conexión. */
export function newId(): string {
  return crypto.randomUUID()
}
