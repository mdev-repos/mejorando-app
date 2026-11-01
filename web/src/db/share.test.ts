import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { MejorAndoDB } from './db'
import { createDay, createMacro, createMeso, saveItems } from './queries'
import { exportPlan, importPlan, parsePlanText } from './share'

let db: MejorAndoDB

beforeEach(async () => {
  db = new MejorAndoDB(`share-${Math.random()}`)
  await db.open()
})

async function armar() {
  const macro = await createMacro(db, 'Fuerza')
  const meso = await createMeso(db, macro.id, 'PPL', { executions: 3 })
  const day = await createDay(db, meso.id, 'Push')
  await db.exercises.add({
    id: 'mio-1',
    name: 'Press raro',
    group: 'pectorales',
    equipment: 'barra',
    load: 'external',
    custom: true,
  })
  await db.exercises.add({
    id: 'mio-2',
    name: 'No usado',
    group: 'pectorales',
    equipment: 'barra',
    load: 'external',
    custom: true,
  })
  await saveItems(db, day.id, [
    {
      id: 'i1',
      kind: 'normal',
      exerciseId: 'mio-1',
      sets: 3,
      target: { kind: 'reps', reps: 8 },
      restSec: 90,
    },
  ] as never)
  return { macro, meso }
}

describe('compartir rutinas', () => {
  it('exporta el macrociclo con sus días y solo los ejercicios propios que usa', async () => {
    const { macro } = await armar()
    const { file } = await exportPlan(db, { macroId: macro.id })
    expect(file.scope).toBe('macro')
    expect(file.mesocycles).toHaveLength(1)
    expect(file.trainings).toHaveLength(1)
    expect(file.exercises.map((e) => e.id)).toEqual(['mio-1'])
  })

  it('al importar crea todo nuevo en otra base, sin tocar los ids originales', async () => {
    const { macro, meso } = await armar()
    const { file } = await exportPlan(db, { mesoId: meso.id })
    const otra = new MejorAndoDB(`otra-${Math.random()}`)
    await otra.open()
    const r = await importPlan(otra, JSON.parse(JSON.stringify(file)))
    expect(r.mesocycles).toBe(1)
    expect(r.trainings).toBe(1)
    const macros = await otra.macrocycles.toArray()
    expect(macros[0]!.name).toBe('Fuerza')
    expect(macros[0]!.id).not.toBe(macro.id)
    const mesos = await otra.mesocycles.toArray()
    expect(mesos[0]!.id).not.toBe(meso.id)
    expect(mesos[0]!.macroId).toBe(macros[0]!.id)
    const days = await otra.trainings.toArray()
    expect(days[0]!.mesoId).toBe(mesos[0]!.id)
    expect(await otra.exercises.get('mio-1')).toBeTruthy()
  })

  it('importar dos veces en la misma base duplica la rutina en vez de pisarla', async () => {
    const { macro } = await armar()
    const { file } = await exportPlan(db, { macroId: macro.id })
    await importPlan(db, file)
    expect(await db.macrocycles.count()).toBe(2)
    expect(await db.mesocycles.count()).toBe(2)
    expect(await db.trainings.count()).toBe(2)
  })

  it('rechaza archivos que no son una rutina', async () => {
    await expect(importPlan(db, { format: 'mejorando', version: 3 })).rejects.toThrow(
      'no es una rutina',
    )
  })
})

describe('rutina pegada como texto', () => {
  it('encuentra la rutina aunque el chat agregue texto alrededor', async () => {
    const { macro } = await armar()
    const { file } = await exportPlan(db, { macroId: macro.id })
    const parsed = parsePlanText(`Mirá mi rutina\n${JSON.stringify(file)}\nenviado`)
    expect((await importPlan(db, parsed)).trainings).toBe(1)
  })

  it('avisa cuando el texto está cortado o no es una rutina', () => {
    expect(() => parsePlanText('hola')).toThrow('no es una rutina')
    expect(() => parsePlanText('{"format": "mejorando-rut')).toThrow('no es una rutina')
    expect(() => parsePlanText('{"a": }')).toThrow('no está completo')
  })
})
