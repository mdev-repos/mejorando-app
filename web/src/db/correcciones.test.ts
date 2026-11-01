import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { MejorAndoDB } from './db'
import {
  createDay,
  createMacro,
  createMeso,
  deleteSession,
  deleteSet,
  saveItems,
  startSession,
  updateSet,
} from './queries'

let db: MejorAndoDB

beforeEach(async () => {
  db = new MejorAndoDB(`correcciones-${Math.random()}`)
  await db.open()
})

async function sesionHecha() {
  const macro = await createMacro(db, 'M')
  const meso = await createMeso(db, macro.id, 'PPL', { executions: 2 })
  const day = await createDay(db, meso.id, 'Push')
  await saveItems(db, day.id, [
    {
      id: 'i1',
      kind: 'normal',
      exerciseId: 'press-banca',
      sets: 2,
      target: { kind: 'fixed', reps: 8 },
      restSec: 60,
    },
  ] as never)
  const session = await startSession(db, (await db.trainings.get(day.id))!, meso, 1)
  for (let i = 1; i <= 2; i++) {
    await db.sets.add({
      id: `s${i}`,
      sessionId: session.id,
      itemId: 'i1',
      exerciseId: 'press-banca',
      kind: 'effective',
      setIndex: i,
      weight: 80,
      reps: 8,
      at: i,
    })
  }
  await db.sessions.update(session.id, { status: 'done', endedAt: 10 })
  return session
}

describe('corregir lo ya hecho', () => {
  it('cambia el peso y las repeticiones de una serie mal cargada', async () => {
    await sesionHecha()
    await updateSet(db, 's1', { weight: 82.5, reps: 6 })
    const s = await db.sets.get('s1')
    expect(s).toMatchObject({ weight: 82.5, reps: 6 })
    expect(await db.sets.get('s2')).toMatchObject({ weight: 80, reps: 8 })
  })

  it('borra solo la serie elegida', async () => {
    await sesionHecha()
    await deleteSet(db, 's2')
    expect(await db.sets.count()).toBe(1)
  })

  it('borra la sesión con todas sus series y no toca las demás', async () => {
    const a = await sesionHecha()
    const otra = await db.sessions.add({ ...a, id: 'otra' })
    await db.sets.add({
      id: 'x',
      sessionId: 'otra',
      itemId: 'i1',
      exerciseId: 'press-banca',
      kind: 'effective',
      setIndex: 1,
      weight: 50,
      reps: 10,
      at: 99,
    })
    await deleteSession(db, a.id)
    expect(await db.sessions.get(a.id)).toBeUndefined()
    expect((await db.sets.toArray()).map((s) => s.id)).toEqual(['x'])
    expect(otra).toBe('otra')
  })
})
