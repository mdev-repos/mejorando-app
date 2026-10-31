import type { MejorAndoDB } from '../../db/db'

export interface Progress {
  done: number
  total: number
}

/** Cuántas ejecuciones de un mesociclo se hicieron, de las que tiene en total. */
export async function mesoProgress(db: MejorAndoDB, mesoId: string): Promise<Progress> {
  const meso = await db.mesocycles.get(mesoId)
  if (!meso) return { done: 0, total: 0 }
  const days = await db.trainings
    .where('mesoId')
    .equals(mesoId)
    .filter((t) => !t.deletedAt)
    .toArray()
  const sessions = await db.sessions.where('mesoId').equals(mesoId).toArray()
  const done = new Set(
    sessions.filter((s) => s.status === 'done').map((s) => `${s.trainingId}:${s.execution}`),
  )
  const valid = days.flatMap((d) =>
    Array.from({ length: meso.executions }, (_, i) => `${d.id}:${i + 1}`),
  )
  return { done: valid.filter((k) => done.has(k)).length, total: valid.length }
}

export async function macroProgress(db: MejorAndoDB, macroId: string): Promise<Progress> {
  const mesos = await db.mesocycles
    .where('macroId')
    .equals(macroId)
    .filter((m) => !m.deletedAt)
    .toArray()
  const parts = await Promise.all(mesos.map((m) => mesoProgress(db, m.id)))
  return parts.reduce((a, p) => ({ done: a.done + p.done, total: a.total + p.total }), {
    done: 0,
    total: 0,
  })
}
