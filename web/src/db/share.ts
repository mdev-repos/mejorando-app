import { newId, type MejorAndoDB } from './db'
import type { Exercise, Macrocycle, Mesocycle, Training } from '../domain/types'

const FORMAT = 'mejorando-rutina'
const VERSION = 1

export interface PlanFile {
  format: typeof FORMAT
  version: number
  exportedAt: number
  /** Si se compartió un macrociclo entero o un solo mesociclo. */
  scope: 'macro' | 'meso'
  macroName: string
  mesocycles: Mesocycle[]
  trainings: Training[]
  /** Los ejercicios propios que usa la rutina, para que lleguen con ella. */
  exercises: Exercise[]
}

export type PlanTarget = { macroId: string } | { mesoId: string }

/** Arma el archivo con la rutina y nada del historial, para pasarla a otra persona. */
export async function exportPlan(
  db: MejorAndoDB,
  target: PlanTarget,
  now = Date.now(),
): Promise<{ file: PlanFile; name: string }> {
  let macro: Macrocycle | undefined
  let mesos: Mesocycle[]
  let scope: PlanFile['scope']
  if ('macroId' in target) {
    macro = await db.macrocycles.get(target.macroId)
    mesos = await db.mesocycles.where('macroId').equals(target.macroId).toArray()
    scope = 'macro'
  } else {
    const meso = await db.mesocycles.get(target.mesoId)
    if (!meso) throw new Error('No se encontró el mesociclo')
    macro = await db.macrocycles.get(meso.macroId)
    mesos = [meso]
    scope = 'meso'
  }
  if (!macro) throw new Error('No se encontró el macrociclo')
  mesos = mesos.filter((m) => !m.deletedAt).sort((a, b) => a.order - b.order)
  const trainings = (
    await db.trainings
      .where('mesoId')
      .anyOf(mesos.map((m) => m.id))
      .toArray()
  )
    .filter((t) => !t.deletedAt)
    .sort((a, b) => a.order - b.order)
  const text = JSON.stringify(trainings)
  const custom = await db.exercises.filter((e) => e.custom === true).toArray()
  const exercises = custom.filter((e) => text.includes(e.id))
  const name = scope === 'macro' ? macro.name : mesos[0]!.name
  return {
    name,
    file: {
      format: FORMAT,
      version: VERSION,
      exportedAt: now,
      scope,
      macroName: macro.name,
      mesocycles: mesos,
      trainings,
      exercises,
    },
  }
}

/**
 * Agrega la rutina como algo nuevo, con identificadores propios, así que nunca pisa lo que ya hay.
 * Siempre queda dentro de un macrociclo nuevo con el nombre del original.
 */
export async function importPlan(
  db: MejorAndoDB,
  file: unknown,
  now = Date.now(),
): Promise<{ macroId: string; mesocycles: number; trainings: number }> {
  const f = file as Partial<PlanFile> | null
  if (!f || f.format !== FORMAT || typeof f.version !== 'number') {
    throw new Error('El archivo no es una rutina de MejorAndo')
  }
  if (f.version > VERSION) throw new Error('El archivo es de una versión más nueva de la app')
  const mesos = Array.isArray(f.mesocycles) ? f.mesocycles : []
  const trainings = Array.isArray(f.trainings) ? f.trainings : []
  const exercises = Array.isArray(f.exercises) ? f.exercises : []
  if (mesos.length === 0) throw new Error('La rutina no tiene mesociclos')

  const macro: Macrocycle = {
    id: newId(),
    name: String(f.macroName || 'Rutina recibida'),
    createdAt: now,
    updatedAt: now,
  }
  const mesoIds = new Map(mesos.map((m) => [m.id, newId()]))
  const newMesos = mesos.map((m) => ({
    ...m,
    id: mesoIds.get(m.id)!,
    macroId: macro.id,
    createdAt: now,
    updatedAt: now,
  }))
  const newTrainings = trainings
    .filter((t) => mesoIds.has(t.mesoId))
    .map((t) => ({
      ...t,
      id: newId(),
      mesoId: mesoIds.get(t.mesoId)!,
      createdAt: now,
      updatedAt: now,
    }))

  await db.transaction(
    'rw',
    [db.exercises, db.macrocycles, db.mesocycles, db.trainings],
    async () => {
      // si el ejercicio propio ya existe se deja el que está
      for (const e of exercises) {
        if (!(await db.exercises.get(e.id))) await db.exercises.add({ ...e, custom: true })
      }
      await db.macrocycles.add(macro)
      await db.mesocycles.bulkAdd(newMesos)
      await db.trainings.bulkAdd(newTrainings)
    },
  )
  return { macroId: macro.id, mesocycles: newMesos.length, trainings: newTrainings.length }
}

/** Lee una rutina pegada como texto, aunque venga con algo de más antes o después, como pasa en un chat. */
export function parsePlanText(text: string): unknown {
  const from = text.indexOf('{')
  const to = text.lastIndexOf('}')
  if (from < 0 || to <= from) throw new Error('El texto no es una rutina de MejorAndo')
  try {
    return JSON.parse(text.slice(from, to + 1))
  } catch {
    throw new Error('El texto no está completo. Copiá el mensaje entero y probá de nuevo.')
  }
}
