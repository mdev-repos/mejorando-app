import type { MejorAndoDB } from './db'

const FORMAT = 'mejorando'
const OLD_FORMATS = ['camino-plus']
const VERSION = 3

export interface ExportFile {
  format: typeof FORMAT
  version: number
  exportedAt: number
  data: {
    exercises: unknown[]
    exerciseSettings?: unknown[]
    macrocycles?: unknown[]
    mesocycles?: unknown[]
    trainings: unknown[]
    sessions: unknown[]
    sets: unknown[]
  }
}

/** Exporta todo lo que la persona creó. El catálogo base no se incluye, viene con la app. */
export async function exportAll(db: MejorAndoDB, now = Date.now()): Promise<ExportFile> {
  const [exercises, exerciseSettings, macrocycles, mesocycles, trainings, sessions, sets] =
    await Promise.all([
      db.exercises.filter((e) => e.custom === true).toArray(),
      db.exerciseSettings.toArray(),
      db.macrocycles.toArray(),
      db.mesocycles.toArray(),
      db.trainings.toArray(),
      db.sessions.toArray(),
      db.sets.toArray(),
    ])
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: now,
    data: { exercises, exerciseSettings, macrocycles, mesocycles, trainings, sessions, sets },
  }
}

export async function importAll(
  db: MejorAndoDB,
  file: unknown,
): Promise<{ trainings: number; sessions: number; sets: number; exercises: number }> {
  const f = file as Partial<ExportFile> | null
  if (
    !f ||
    (f.format !== FORMAT && !OLD_FORMATS.includes(String(f.format))) ||
    typeof f.version !== 'number' ||
    !f.data
  ) {
    throw new Error('El archivo no es una copia de MejorAndo')
  }
  if (f.version > VERSION) throw new Error('El archivo es de una versión más nueva de la app')
  const d = f.data
  if (f.version < 2) wrapOldTrainings(d)
  const list = (x: unknown): never[] => (Array.isArray(x) ? (x as never[]) : [])
  await db.transaction(
    'rw',
    [
      db.exercises,
      db.exerciseSettings,
      db.macrocycles,
      db.mesocycles,
      db.trainings,
      db.sessions,
      db.sets,
    ],
    async () => {
      await db.exercises.bulkPut(list(d.exercises))
      await db.exerciseSettings.bulkPut(list(d.exerciseSettings))
      await db.macrocycles.bulkPut(list(d.macrocycles))
      await db.mesocycles.bulkPut(list(d.mesocycles))
      await db.trainings.bulkPut(list(d.trainings))
      await db.sessions.bulkPut(list(d.sessions))
      await db.sets.bulkPut(list(d.sets))
    },
  )
  return {
    exercises: list(d.exercises).length,
    trainings: list(d.trainings).length,
    sessions: list(d.sessions).length,
    sets: list(d.sets).length,
  }
}

/** Una copia de la versión anterior no tiene macrociclos, así que se arman uno y un mesociclo para sus entrenamientos. */
function wrapOldTrainings(d: ExportFile['data']): void {
  const trainings = (Array.isArray(d.trainings) ? d.trainings : []) as Record<string, unknown>[]
  if (!trainings.length) return
  const now = Date.now()
  const macroId = crypto.randomUUID()
  const mesoId = crypto.randomUUID()
  const executions = 4
  d.macrocycles = [{ id: macroId, name: 'Mis entrenamientos', createdAt: now, updatedAt: now }]
  d.mesocycles = [
    {
      id: mesoId,
      macroId,
      name: 'General',
      order: 0,
      mode: 'simple',
      executions,
      createdAt: now,
      updatedAt: now,
    },
  ]
  trainings.forEach((t, i) => Object.assign(t, { mesoId, order: i }))
  const counts = new Map<string, number>()
  const sessions = (Array.isArray(d.sessions) ? d.sessions : []) as Record<string, unknown>[]
  sessions
    .sort((a, b) => Number(a.startedAt) - Number(b.startedAt))
    .forEach((s) => {
      const key = String(s.trainingId)
      const n = (counts.get(key) ?? 0) + 1
      counts.set(key, n)
      Object.assign(s, {
        mesoId,
        mesoName: 'General',
        execution: Math.min(n, executions),
        executionsTotal: executions,
      })
    })
}
