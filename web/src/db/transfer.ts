import type { CaminoDB } from './db'

const FORMAT = 'camino-plus'
const VERSION = 1

export interface ExportFile {
  format: typeof FORMAT
  version: number
  exportedAt: number
  data: {
    exercises: unknown[]
    trainings: unknown[]
    sessions: unknown[]
    sets: unknown[]
  }
}

/** Exporta todo lo que la persona creó. El catálogo base no se incluye, viene con la app. */
export async function exportAll(db: CaminoDB, now = Date.now()): Promise<ExportFile> {
  const [exercises, trainings, sessions, sets] = await Promise.all([
    db.exercises.filter((e) => e.custom === true).toArray(),
    db.trainings.toArray(),
    db.sessions.toArray(),
    db.sets.toArray(),
  ])
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: now,
    data: { exercises, trainings, sessions, sets },
  }
}

export async function importAll(
  db: CaminoDB,
  file: unknown,
): Promise<{ trainings: number; sessions: number; sets: number; exercises: number }> {
  const f = file as Partial<ExportFile> | null
  if (!f || f.format !== FORMAT || typeof f.version !== 'number' || !f.data) {
    throw new Error('El archivo no es una copia de Camino+')
  }
  if (f.version > VERSION) throw new Error('El archivo es de una versión más nueva de la app')
  const d = f.data
  const list = (x: unknown): never[] => (Array.isArray(x) ? (x as never[]) : [])
  await db.transaction('rw', db.exercises, db.trainings, db.sessions, db.sets, async () => {
    await db.exercises.bulkPut(list(d.exercises))
    await db.trainings.bulkPut(list(d.trainings))
    await db.sessions.bulkPut(list(d.sessions))
    await db.sets.bulkPut(list(d.sets))
  })
  return {
    exercises: list(d.exercises).length,
    trainings: list(d.trainings).length,
    sessions: list(d.sessions).length,
    sets: list(d.sets).length,
  }
}
