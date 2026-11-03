import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { SEED_EXERCISES } from '../domain/catalog'
import { buildSteps } from '../domain/session'
import type { PlanItem } from '../domain/types'
import { MejorAndoDB } from './db'
import {
  completeStep,
  createDay,
  createMacro,
  createMeso,
  saveItems,
  startSession,
  undoStep,
} from './queries'

let db: MejorAndoDB

beforeEach(async () => {
  db = new MejorAndoDB(`deshacer-${Math.random()}`)
  await db.open()
})

const ITEMS: PlanItem[] = [
  {
    id: 'i1',
    kind: 'restpause',
    exerciseId: 'press-banca',
    sets: 2,
    target: { kind: 'fixed', reps: 8 },
    restSec: 60,
    restPauseSec: 20,
  },
]
const lookup = (id: string) => SEED_EXERCISES.find((e) => e.id === id)

async function nuevaSesion() {
  const macro = await createMacro(db, 'M')
  const meso = await createMeso(db, macro.id, 'PPL', { executions: 2 })
  const day = await createDay(db, meso.id, 'Push')
  await saveItems(db, day.id, ITEMS)
  const session = await startSession(db, (await db.trainings.get(day.id))!, meso, 1)
  return { session, steps: buildSteps(ITEMS, lookup) }
}

describe('deshacer un paso', () => {
  it('borra la serie, deja los valores para corregir y descarta el descanso', async () => {
    const { session, steps } = await nuevaSesion()
    // aproximación (sin series), serie 1 con 8 + 3
    await completeStep(db, session.id, steps, {})
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 1, weight: 60, reps: 8, techReps: 3 }],
    })
    expect(await db.sets.count()).toBe(1)

    await undoStep(db, session.id, steps)
    const s = await db.sessions.get(session.id)
    expect(s?.stepIndex).toBe(1)
    expect(s?.restEndAt).toBeNull()
    expect(s?.redo?.logs).toEqual([
      { kind: 'effective', setIndex: 1, weight: 60, reps: 8, techReps: 3 },
    ])
    expect(await db.sets.count()).toBe(0)
  })

  it('al completar de nuevo el paso corregido, ya no queda nada por rehacer', async () => {
    const { session, steps } = await nuevaSesion()
    await completeStep(db, session.id, steps, {})
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 1, weight: 60, reps: 8 }],
    })
    await undoStep(db, session.id, steps)
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 1, weight: 62.5, reps: 8 }],
    })
    const s = await db.sessions.get(session.id)
    expect(s?.redo).toBeUndefined()
    expect((await db.sets.toArray()).map((l) => l.weight)).toEqual([62.5])
  })

  it('en el tramo de rest pause quita solo las repeticiones extra', async () => {
    const { session, steps } = await nuevaSesion()
    await completeStep(db, session.id, steps, {})
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 1, weight: 60, reps: 8 }],
    })
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 2, weight: 60, reps: 7 }],
    })
    await completeStep(db, session.id, steps, { extraReps: 3 })
    expect((await db.sets.toArray()).find((l) => l.setIndex === 2)?.extraReps).toBe(3)

    await undoStep(db, session.id, steps)
    const sets = await db.sets.toArray()
    expect(sets).toHaveLength(2)
    expect(sets.find((l) => l.setIndex === 2)?.extraReps).toBeUndefined()
    expect((await db.sessions.get(session.id))?.redo?.extraReps).toBe(3)
  })

  it('reabre una sesión que terminó al tocar la última serie', async () => {
    const { session, steps } = await nuevaSesion()
    for (const input of [
      {},
      { logs: [{ kind: 'effective' as const, setIndex: 1, weight: 60, reps: 8 }] },
      { logs: [{ kind: 'effective' as const, setIndex: 2, weight: 60, reps: 8 }] },
      { extraReps: 2 },
    ]) {
      await completeStep(db, session.id, steps, input)
    }
    expect((await db.sessions.get(session.id))?.status).toBe('done')

    await undoStep(db, session.id, steps)
    const s = await db.sessions.get(session.id)
    expect(s?.status).toBe('active')
    expect(s?.endedAt).toBeUndefined()
    expect(s?.stepIndex).toBe(steps.length - 1)
  })

  it('una sesión cortada antes de tiempo se reanuda sin borrar nada', async () => {
    const { session, steps } = await nuevaSesion()
    await completeStep(db, session.id, steps, {})
    await completeStep(db, session.id, steps, {
      logs: [{ kind: 'effective', setIndex: 1, weight: 60, reps: 8 }],
    })
    await db.sessions.update(session.id, { status: 'done', endedAt: Date.now() })

    await undoStep(db, session.id, steps)
    const s = await db.sessions.get(session.id)
    expect(s?.status).toBe('active')
    expect(s?.stepIndex).toBe(2)
    expect(await db.sets.count()).toBe(1)
  })
})
