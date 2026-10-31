import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { SEED_EXERCISES } from '../domain/catalog'
import type { PlanItem } from '../domain/types'
import { CaminoDB } from './db'
import {
  completeStep,
  createTraining,
  flowOf,
  previousSets,
  saveItems,
  seedCatalog,
  startSession,
  stepsOf,
} from './queries'
import { exportAll, importAll } from './transfer'

const plan: PlanItem[] = [
  {
    id: 'a',
    kind: 'normal',
    exerciseId: 'press-banca',
    sets: 2,
    target: { kind: 'fixed', reps: 8 },
    restSec: 90,
  },
  {
    id: 'b',
    kind: 'restpause',
    exerciseId: 'press-banca-inclinado',
    sets: 1,
    target: { kind: 'fixed', reps: 8 },
    restSec: 90,
    restPauseSec: 20,
  },
]

let db: CaminoDB
beforeEach(async () => {
  db = new CaminoDB(`test-${crypto.randomUUID()}`)
  await seedCatalog(db)
})

describe('catálogo', () => {
  it('se carga una sola vez aunque la app arranque varias veces', async () => {
    await seedCatalog(db)
    expect(await db.exercises.count()).toBe(SEED_EXERCISES.length)
  })
})

async function trainWith(items: PlanItem[]) {
  const t = await createTraining(db, 'Upper A', 1_000)
  await saveItems(db, t.id, items, 1_000)
  return (await db.trainings.get(t.id))!
}

async function runSession(startedAt: number, weights: number[]) {
  const training = await trainWith(plan)
  const session = await startSession(db, training, startedAt)
  const exercises = await db.exercises.toArray()
  const steps = stepsOf(session, exercises)
  let now = startedAt
  let w = 0
  let current = session
  for (const step of steps) {
    now += 1_000
    if (step.type === 'approach') {
      current = await completeStep(
        db,
        session.id,
        steps,
        { logs: [{ kind: 'approach', setIndex: 1, weight: 20, reps: 10 }] },
        now,
      )
    } else if (step.type === 'set') {
      current = await completeStep(
        db,
        session.id,
        steps,
        {
          logs: [
            { kind: 'effective', setIndex: step.setIndex, weight: weights[w++] ?? 0, reps: 8 },
          ],
        },
        now,
      )
    } else {
      current = await completeStep(db, session.id, steps, { extraReps: 3 }, now)
    }
  }
  return current
}

describe('sesión', () => {
  it('guarda cada serie y deja la sesión terminada al final', async () => {
    const done = await runSession(10_000, [80, 80, 60])
    expect(done.status).toBe('done')
    expect(done.endedAt).toBeDefined()
    const effective = await db.sets
      .where('sessionId')
      .equals(done.id)
      .filter((s) => s.kind === 'effective')
      .toArray()
    expect(effective).toHaveLength(3)
  })

  it('el tramo de rest pause se guarda en la última serie', async () => {
    const done = await runSession(10_000, [80, 80, 60])
    const rp = await db.sets
      .where('sessionId')
      .equals(done.id)
      .filter((s) => s.itemId === 'b')
      .toArray()
    expect(rp).toHaveLength(1)
    expect(rp[0]).toMatchObject({ weight: 60, reps: 8, extraReps: 3 })
  })

  it('arranca el descanso con la hora de fin después de una serie', async () => {
    const training = await trainWith(plan)
    const session = await startSession(db, training, 5_000)
    const steps = stepsOf(session, await db.exercises.toArray())
    await completeStep(
      db,
      session.id,
      steps,
      { logs: [{ kind: 'approach', setIndex: 1, weight: 20, reps: 10 }] },
      6_000,
    )
    const after = await completeStep(
      db,
      session.id,
      steps,
      { logs: [{ kind: 'effective', setIndex: 1, weight: 80, reps: 8 }] },
      7_000,
    )
    expect(flowOf(after)).toMatchObject({
      stepIndex: 2,
      restEndAt: 7_000 + 90_000,
      restTotalSec: 90,
    })
  })

  it('el plan queda copiado y editar el entrenamiento no cambia una sesión en curso', async () => {
    const training = await trainWith(plan)
    const session = await startSession(db, training, 1)
    await saveItems(db, training.id, [], 2)
    const stored = await db.sessions.get(session.id)
    expect(stored?.plan).toHaveLength(2)
  })
})

describe('la vez anterior', () => {
  it('devuelve las series de la última sesión anterior, ordenadas', async () => {
    await runSession(10_000, [70, 70, 50])
    const second = await runSession(20_000, [75, 75, 55])
    const prev = await previousSets(db, 'press-banca', 'effective', 'otra-sesion')
    expect(prev.map((s) => s.weight)).toEqual([75, 75])
    const prevForSecond = await previousSets(db, 'press-banca', 'effective', second.id)
    expect(prevForSecond.map((s) => s.weight)).toEqual([70, 70])
  })

  it('sin sesiones anteriores no hay nada para comparar', async () => {
    expect(await previousSets(db, 'press-banca', 'effective', 'x')).toEqual([])
  })
})

describe('exportar e importar', () => {
  it('una copia se puede restaurar en otro dispositivo', async () => {
    await runSession(10_000, [80, 80, 60])
    const file = JSON.parse(JSON.stringify(await exportAll(db, 99)))
    const other = new CaminoDB(`test-${crypto.randomUUID()}`)
    const counts = await importAll(other, file)
    expect(counts.trainings).toBe(1)
    expect(await other.sets.count()).toBe(await db.sets.count())
  })

  it('rechaza archivos que no son de la app', async () => {
    await expect(importAll(db, { hola: 1 })).rejects.toThrow('no es una copia')
  })
})
