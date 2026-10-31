import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { SEED_EXERCISES } from '../domain/catalog'
import type { Mesocycle, PlanItem, Training } from '../domain/types'
import { MejorAndoDB } from './db'
import {
  clearExecution,
  completeStep,
  createDay,
  createMacro,
  createMeso,
  executionStatus,
  finishSession,
  flowOf,
  itemsFor,
  previousSets,
  saveItems,
  seedCatalog,
  setWeightStep,
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

let db: MejorAndoDB
beforeEach(async () => {
  db = new MejorAndoDB(`test-${crypto.randomUUID()}`)
  await seedCatalog(db)
})

describe('catálogo', () => {
  it('se carga una sola vez aunque la app arranque varias veces', async () => {
    await seedCatalog(db)
    expect(await db.exercises.count()).toBe(SEED_EXERCISES.length)
  })
})

async function trainWith(items: PlanItem[], mode: 'simple' | 'advanced' = 'simple') {
  const macro = await createMacro(db, 'Principiante', 1_000)
  const meso = await createMeso(db, macro.id, 'PPL', { mode, executions: 4 }, 1_000)
  const day = await createDay(db, meso.id, 'Push', 1_000)
  await saveItems(db, day.id, items, 1, 1_000)
  return { meso, day: (await db.trainings.get(day.id))! }
}

async function runSession(startedAt: number, weights: number[]) {
  const { meso, day } = await trainWith(plan)
  const session = await startSession(db, day, meso, 1, startedAt)
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
    const { meso, day } = await trainWith(plan)
    const session = await startSession(db, day, meso, 1, 5_000)
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
    const { meso, day } = await trainWith(plan)
    const session = await startSession(db, day, meso, 1, 1)
    await saveItems(db, day.id, [], 1, 2)
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
    const other = new MejorAndoDB(`test-${crypto.randomUUID()}`)
    const counts = await importAll(other, file)
    expect(counts.trainings).toBe(1)
    expect(await other.sets.count()).toBe(await db.sets.count())
  })

  it('rechaza archivos que no son de la app', async () => {
    await expect(importAll(db, { hola: 1 })).rejects.toThrow('no es una copia')
  })
})

describe('los cuatro niveles', () => {
  const alt: PlanItem[] = [
    {
      id: 'z',
      kind: 'normal',
      exerciseId: 'sentadilla',
      sets: 5,
      target: { kind: 'fixed', reps: 5 },
      restSec: 150,
    },
  ]

  it('una rutina simple usa los mismos ejercicios en todas las ejecuciones', async () => {
    const { meso, day } = await trainWith(plan)
    await saveItems(db, day.id, alt, 3)
    const fresh = (await db.trainings.get(day.id))!
    expect(itemsFor(fresh, 3, meso.mode)).toEqual(plan)
  })

  it('una rutina avanzada puede cambiar una ejecución y las demás siguen la primera', async () => {
    const { meso, day } = await trainWith(plan, 'advanced')
    await saveItems(db, day.id, alt, 3)
    const fresh = (await db.trainings.get(day.id))!
    expect(itemsFor(fresh, 1, meso.mode)).toEqual(plan)
    expect(itemsFor(fresh, 2, meso.mode)).toEqual(plan)
    expect(itemsFor(fresh, 3, meso.mode)).toEqual(alt)
    await clearExecution(db, day.id, 3)
    expect(itemsFor((await db.trainings.get(day.id))!, 3, meso.mode)).toEqual(plan)
  })

  it('cada sesión copia los ejercicios de su ejecución', async () => {
    const { meso, day } = await trainWith(plan, 'advanced')
    await saveItems(db, day.id, alt, 2)
    const fresh = (await db.trainings.get(day.id))!
    const session = await startSession(db, fresh, meso, 2, 10)
    expect(session.plan).toEqual(alt)
    expect(session).toMatchObject({ execution: 2, executionsTotal: 4, mesoName: 'PPL' })
  })

  it('muestra qué ejecuciones están hechas, cuál está en curso y cuáles faltan', async () => {
    const { meso, day } = await trainWith(plan)
    const first = await startSession(db, day, meso, 1, 10)
    await finishSession(db, first.id, 20)
    await startSession(db, day, meso, 2, 30)
    const status = await executionStatus(db, day.id, meso.executions)
    expect(status.map((s) => s.state)).toEqual(['done', 'active', 'pending', 'pending'])
  })

  it('los días de un mesociclo se ordenan solos', async () => {
    const macro = await createMacro(db, 'M')
    const meso: Mesocycle = await createMeso(db, macro.id, 'PPL')
    const a: Training = await createDay(db, meso.id, 'Push')
    const b: Training = await createDay(db, meso.id, 'Pull')
    expect([a.order, b.order]).toEqual([0, 1])
  })
})

describe('datos de la versión anterior', () => {
  it('pasan a un macrociclo y un mesociclo propios, con sus ejecuciones numeradas', async () => {
    const name = `old-${crypto.randomUUID()}`
    const old = new Dexie(name)
    old.version(1).stores({
      exercises: 'id, group',
      trainings: 'id, updatedAt',
      sessions: 'id, status, startedAt',
      sets: 'id, sessionId, exerciseId, [exerciseId+kind]',
    })
    await old
      .table('trainings')
      .add({ id: 't1', name: 'Upper A', items: [], createdAt: 1, updatedAt: 1 })
    await old.table('sessions').bulkAdd([
      {
        id: 's1',
        trainingId: 't1',
        trainingName: 'Upper A',
        plan: [],
        startedAt: 10,
        status: 'done',
        stepIndex: 0,
        restEndAt: null,
        restTotalSec: 0,
      },
      {
        id: 's2',
        trainingId: 't1',
        trainingName: 'Upper A',
        plan: [],
        startedAt: 20,
        status: 'done',
        stepIndex: 0,
        restEndAt: null,
        restTotalSec: 0,
      },
    ])
    old.close()

    const migrated = new MejorAndoDB(name)
    expect(await migrated.macrocycles.count()).toBe(1)
    const meso = (await migrated.mesocycles.toArray())[0]!
    expect((await migrated.trainings.get('t1'))?.mesoId).toBe(meso.id)
    const sessions = (await migrated.sessions.orderBy('startedAt').toArray()).map(
      (s) => s.execution,
    )
    expect(sessions).toEqual([1, 2])
  })
})

describe('ajustes por ejercicio', () => {
  it('el paso de peso se recuerda y viaja en la copia de seguridad', async () => {
    await setWeightStep(db, 'press-banca', 5)
    expect((await db.exerciseSettings.get('press-banca'))?.weightStep).toBe(5)
    const file = JSON.parse(JSON.stringify(await exportAll(db, 1)))
    const other = new MejorAndoDB(`test-${crypto.randomUUID()}`)
    await importAll(other, file)
    expect((await other.exerciseSettings.get('press-banca'))?.weightStep).toBe(5)
  })
})
