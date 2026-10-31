import { describe, expect, it } from 'vitest'
import { SEED_EXERCISES } from './catalog'
import {
  adjustRest,
  advance,
  buildSteps,
  initialFlow,
  isFinished,
  restRemainingSec,
  skipRest,
} from './session'
import { escalonado, targetForSet } from './targets'
import type { PlanItem } from './types'

const lookup = (id: string) => SEED_EXERCISES.find((e) => e.id === id)

const plan: PlanItem[] = [
  {
    id: 'a',
    kind: 'normal',
    exerciseId: 'press-banca',
    sets: 2,
    target: { kind: 'fixed', reps: 8 },
    restSec: 120,
  },
  {
    id: 'b',
    kind: 'restpause',
    exerciseId: 'press-banca-inclinado',
    sets: 2,
    target: { kind: 'range', min: 6, max: 8 },
    restSec: 120,
    restPauseSec: 20,
  },
  {
    id: 'c',
    kind: 'jumpset',
    rounds: 2,
    steps: [
      { exerciseId: 'curl-barra', target: { kind: 'fixed', reps: 10 }, restSec: 20 },
      { exerciseId: 'extension-polea', target: { kind: 'fixed', reps: 12 }, restSec: 60 },
    ],
  },
]

describe('buildSteps', () => {
  const steps = buildSteps(plan, lookup)

  it('pide aproximación solo al empezar cada grupo muscular', () => {
    const approaches = steps.filter((s) => s.type === 'approach')
    // pectorales (los dos primeros items comparten grupo) y bíceps (el JumpSet empieza en bíceps)
    expect(approaches.map((s) => s.type === 'approach' && s.group)).toEqual([
      'pectorales',
      'biceps',
    ])
  })

  it('el rest pause agrega un tramo extra después de la última serie', () => {
    const rpIndex = steps.findIndex((s) => s.type === 'restpause')
    const lastSet = steps[rpIndex - 1]
    expect(lastSet).toMatchObject({
      type: 'set',
      setIndex: 2,
      restPauseNext: true,
      restAfterSec: 20,
    })
    expect(steps[rpIndex]).toMatchObject({ type: 'restpause', restAfterSec: 120 })
    expect(steps.filter((s) => s.type === 'restpause')).toHaveLength(1)
  })

  it('el JumpSet alterna ejercicios por rondas, cada uno con su descanso', () => {
    const jumps = steps.filter((s) => s.type === 'jump')
    expect(jumps.map((s) => s.type === 'jump' && [s.round, s.exerciseId, s.restAfterSec])).toEqual([
      [1, 'curl-barra', 20],
      [1, 'extension-polea', 60],
      [2, 'curl-barra', 20],
      [2, 'extension-polea', 60],
    ])
  })
})

describe('flujo y descansos', () => {
  const steps = buildSteps(plan, lookup)

  it('después de una serie arranca el descanso con la hora de fin', () => {
    let state = initialFlow()
    state = advance(state, steps, 1_000) // sale de la aproximación, sin descanso
    expect(state.restEndAt).toBeNull()
    state = advance(state, steps, 2_000) // serie 1 de press banca
    expect(state).toMatchObject({ stepIndex: 2, restEndAt: 2_000 + 120_000, restTotalSec: 120 })
  })

  it('el descanso se calcula con la hora de fin y no cuenta segundos', () => {
    expect(restRemainingSec(10_000, 1_000)).toBe(9)
    expect(restRemainingSec(10_000, 9_001)).toBe(1)
    expect(restRemainingSec(10_000, 20_000)).toBe(0)
  })

  it('se puede sumar, restar y saltear el descanso', () => {
    const base = { stepIndex: 3, restEndAt: 100_000, restTotalSec: 60 }
    expect(adjustRest(base, 15, 50_000)).toMatchObject({ restEndAt: 115_000, restTotalSec: 75 })
    expect(adjustRest(base, -15, 50_000)).toMatchObject({ restEndAt: 85_000, restTotalSec: 45 })
    expect(adjustRest({ ...base, restEndAt: 55_000 }, -15, 50_000).restEndAt).toBe(50_000)
    expect(skipRest(base).restEndAt).toBeNull()
  })

  it('al terminar el último paso no hay descanso y la sesión queda terminada', () => {
    const last = { stepIndex: steps.length - 1, restEndAt: null, restTotalSec: 0 }
    const done = advance(last, steps, 5_000)
    expect(done.restEndAt).toBeNull()
    expect(isFinished(done, steps)).toBe(true)
  })
})

describe('escalonado', () => {
  it('arma 10, 8, 6 y 4 con 4 series, 10 repeticiones y un salto de menos 2', () => {
    expect(escalonado(4, 10, -2)).toEqual({ kind: 'sequence', reps: [10, 8, 6, 4] })
  })

  it('el salto puede ser positivo y nunca baja de 1 repetición', () => {
    expect(escalonado(3, 6, 2)).toEqual({ kind: 'sequence', reps: [6, 8, 10] })
    expect(escalonado(5, 4, -2)).toEqual({ kind: 'sequence', reps: [4, 2, 1, 1, 1] })
  })

  it('cada serie de la sesión pide su cantidad', () => {
    const item: PlanItem = {
      id: 'e',
      kind: 'normal',
      exerciseId: 'press-banca',
      sets: 4,
      target: escalonado(4, 10, -2),
      restSec: 90,
    }
    const sets = buildSteps([item], lookup).filter((s) => s.type === 'set')
    expect(sets.map((s) => s.type === 'set' && targetForSet(s.target, 1))).toEqual([
      { kind: 'fixed', reps: 10 },
      { kind: 'fixed', reps: 8 },
      { kind: 'fixed', reps: 6 },
      { kind: 'fixed', reps: 4 },
    ])
  })
})
